"use strict";

// All pages use the same Local Storage key.
const STORAGE_KEY = "carZoneCars";

function loadCars() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    console.error("Could not read saved cars:", error);
    return [];
  }
}

function saveCars(cars) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
    return true;
  } catch (error) {
    console.error("Could not save cars:", error);
    alert("Unable to save. Check whether your browser allows Local Storage.");
    return false;
  }
}

function makeId() {
  return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9);
}

function showStatus(message, success = true) {
  const element = document.getElementById("carStatus");
  if (!element) return;
  element.textContent = message;
  element.className = "mt-3 mb-0 " + (success ? "text-success" : "text-danger");
}

function formatPrice(price) {
  const value = Number(price);
  return Number.isFinite(value) ? "$" + value.toLocaleString("en-US") : "—";
}

// Using textContent (not raw HTML) keeps entered car names safe.
function textNode(tag, value, className = "") {
  const el = document.createElement(tag);
  el.textContent = value;
  if (className) el.className = className;
  return el;
}

function makeButton(label, action, id, cssClass) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.id = id;
  button.className = cssClass;
  return button;
}

function makeCarCard(car) {
  const column = document.createElement("div");
  column.className = "col-md-6 col-lg-4";
  const card = document.createElement("article");
  card.className = "card h-100 shadow-sm";

  if (car.image) {
    const picture = document.createElement("img");
    picture.className = "card-img-top";
    picture.alt = car.name;
    picture.loading = "lazy";
    picture.src = car.image;
    picture.onerror = function () { this.remove(); };
    card.appendChild(picture);
  }

  const body = document.createElement("div");
  body.className = "card-body d-flex flex-column";
  body.appendChild(textNode("h3", car.name || "Unnamed car", "h5"));
  body.appendChild(textNode("p", `${car.brand || ""} · ${car.year || ""}`, "text-secondary mb-1"));
  body.appendChild(textNode("p", formatPrice(car.price), "fw-bold"));
  const actions = document.createElement("div");
  actions.className = "d-flex gap-2 mt-auto";
  actions.appendChild(makeButton("Edit", "edit", car.id, "btn btn-outline-primary btn-sm"));
  actions.appendChild(makeButton("Delete", "delete", car.id, "btn btn-outline-danger btn-sm"));
  body.appendChild(actions);
  card.appendChild(body);
  column.appendChild(card);
  return column;
}

function renderPublicCars() {
  document.querySelectorAll("#publicCars, #homeCars").forEach((container) => {
    container.replaceChildren();
    const cars = loadCars();
    if (cars.length === 0) {
      const empty = document.createElement("div");
      empty.className = "col-12";
      empty.appendChild(textNode("p", "No cars added yet. Add your first car using Manage Cars.", "text-secondary mb-2"));
      const link = document.createElement("a");
      link.href = "manage.html";
      link.className = "btn btn-outline-danger btn-sm";
      link.textContent = "Add your first car";
      empty.appendChild(link);
      container.appendChild(empty);
    } else {
      cars.forEach((car) => container.appendChild(makeCarCard(car)));
    }
  });
}

function renderCarsTable() {
  const body = document.getElementById("carsTableBody");
  if (!body) return;
  body.replaceChildren();
  const cars = loadCars();
  document.getElementById("carCount").textContent = `${cars.length} car${cars.length === 1 ? "" : "s"}`;
  document.getElementById("emptyCars").hidden = cars.length > 0;

  cars.forEach((car) => {
    const row = document.createElement("tr");
    [car.name, car.brand, car.year, formatPrice(car.price)].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    const actionCell = document.createElement("td");
    const actionWrapper = document.createElement("div");
    actionWrapper.className = "d-flex gap-2 flex-wrap";
    actionWrapper.appendChild(makeButton("Edit", "edit", car.id, "btn btn-outline-primary btn-sm"));
    actionWrapper.appendChild(makeButton("Delete", "delete", car.id, "btn btn-outline-danger btn-sm"));
    actionCell.appendChild(actionWrapper);
    row.appendChild(actionCell);
    body.appendChild(row);
  });
}

function resetForm() {
  const form = document.getElementById("carForm");
  if (!form) return;
  form.reset();
  document.getElementById("editId").value = "";
  document.getElementById("formTitle").textContent = "Add a Car";
  document.getElementById("saveCarBtn").textContent = "Add Car";
  document.getElementById("cancelEditBtn").hidden = true;
}

function beginEdit(id) {
  const car = loadCars().find((item) => String(item.id) === String(id));
  if (!car) {
    showStatus("This car was not found.", false);
    return;
  }
  const form = document.getElementById("carForm");
  if (!form) {
    window.location.href = "manage.html?edit=" + encodeURIComponent(id);
    return;
  }
  document.getElementById("editId").value = car.id;
  document.getElementById("carName").value = car.name;
  document.getElementById("carBrand").value = car.brand;
  document.getElementById("carYear").value = car.year;
  document.getElementById("carPrice").value = car.price;
  document.getElementById("carImage").value = car.image || "";
  document.getElementById("formTitle").textContent = "Edit Car";
  document.getElementById("saveCarBtn").textContent = "Save Changes";
  document.getElementById("cancelEditBtn").hidden = false;
  showStatus("You are editing " + car.name + ".");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteCar(id) {
  const cars = loadCars();
  const car = cars.find((item) => String(item.id) === String(id));
  if (!car || !confirm(`Delete ${car.name}?`)) return;
  if (!saveCars(cars.filter((item) => String(item.id) !== String(id)))) return;
  if (document.getElementById("editId")?.value === String(id)) resetForm();
  renderCarsTable();
  renderPublicCars();
  showStatus("Car deleted successfully.");
}

function initManageForm() {
  const form = document.getElementById("carForm");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Do not reload the page when adding a car.
    if (!form.reportValidity()) return;

    const name = document.getElementById("carName").value.trim();
    const brand = document.getElementById("carBrand").value.trim();
    const year = Number(document.getElementById("carYear").value);
    const price = Number(document.getElementById("carPrice").value);
    const image = document.getElementById("carImage").value.trim();
    const editId = document.getElementById("editId").value;

    if (!name || !brand || !Number.isInteger(year) || year < 1886 || year > 2100 || !Number.isFinite(price) || price < 0) {
      showStatus("Enter a valid name, brand, year and price.", false);
      return;
    }
    if (image && !/^https?:\/\//i.test(image)) {
      showStatus("Image URL must start with http:// or https://.", false);
      return;
    }

    const cars = loadCars();
    const data = { name, brand, year, price, image };
    if (editId) {
      const index = cars.findIndex((car) => String(car.id) === editId);
      if (index === -1) {
        showStatus("The car you tried to edit no longer exists.", false);
        return;
      }
      cars[index] = { ...cars[index], ...data };
    } else {
      cars.push({ id: makeId(), ...data });
    }

    if (!saveCars(cars)) {
      showStatus("Could not save car.", false);
      return;
    }
    resetForm();
    renderCarsTable();
    renderPublicCars();
    showStatus(editId ? "Car updated successfully!" : "Car added successfully! It is now visible on Home and Cars.");
  });

  document.getElementById("cancelEditBtn").addEventListener("click", () => {
    resetForm();
    showStatus("Edit canceled.");
  });

  const requestedEdit = new URLSearchParams(window.location.search).get("edit");
  if (requestedEdit) beginEdit(requestedEdit);
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action][data-id]");
  if (!button) return;
  if (button.dataset.action === "edit") beginEdit(button.dataset.id);
  if (button.dataset.action === "delete") deleteCar(button.dataset.id);
});

document.addEventListener("DOMContentLoaded", () => {
  initManageForm();
  renderCarsTable();
  renderPublicCars();

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      document.getElementById("contactStatus").textContent = "Thanks for your message! ";
      contactForm.reset();
    });
  }
});
