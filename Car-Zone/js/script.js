const STORAGE_KEY = "carZoneCars";
function getCars() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    return [];
  }
}
function saveCars(cars) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}
function safeImage(url) {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch (error) {
    return "";
  }
}
function makeCell(row, value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  row.appendChild(cell);
  return cell;
}
function renderCars() {
  const cars = getCars();
  const rows = document.getElementById("carRows");
  if (rows) {
    rows.replaceChildren();
    document.getElementById("emptyMessage").hidden = cars.length > 0;
    cars.forEach(function(car) {
      const row = document.createElement("tr");
      makeCell(row, car.name);
      makeCell(row, car.brand);
      makeCell(row, car.year);
      const actions = document.createElement("td");
      const edit = document.createElement("button");
      edit.className = "btn btn-sm btn-outline-light me-2";
      edit.textContent = "Edit";
      edit.addEventListener("click", function() { editCar(car.id); });
      const remove = document.createElement("button");
      remove.className = "btn btn-sm btn-danger";
      remove.textContent = "Delete";
      remove.addEventListener("click", function() { deleteCar(car.id); });
      actions.append(edit, remove);
      row.appendChild(actions);
      rows.appendChild(row);
    });
  }
  const publicCars = document.getElementById("publicCars");
  if (publicCars) {
    publicCars.replaceChildren();
    if (cars.length === 0) {
      const note = document.createElement("p");
      note.textContent = "No personal cars yet. Add one on the Manage Cars page.";
      publicCars.appendChild(note);
    }
    cars.forEach(function(car) {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
      const card = document.createElement("div");
      card.className = "card h-100";
      const imgUrl = safeImage(car.image);
      if (imgUrl) {
        const img = document.createElement("img");
        img.className = "card-img-top";
        img.src = imgUrl;
        img.alt = car.name;
        card.appendChild(img);
      }
      const content = document.createElement("div");
      content.className = "card-body";
      const heading = document.createElement("h3");
      heading.className = "h5";
      heading.textContent = car.name;
      const details = document.createElement("p");
      details.textContent = car.brand + " · " + car.year;
      content.append(heading, details);
      card.appendChild(content);
      col.appendChild(card);
      publicCars.appendChild(col);
    });
  }
}
function clearForm() {
  document.getElementById("carForm").reset();
  document.getElementById("editId").value = "";
  document.getElementById("saveButton").textContent = "Add Car";
}
function editCar(id) {
  const car = getCars().find(function(item) { return item.id === id; });
  if (!car) return;
  document.getElementById("editId").value = car.id;
  document.getElementById("carName").value = car.name;
  document.getElementById("carBrand").value = car.brand;
  document.getElementById("carYear").value = car.year;
  document.getElementById("carImage").value = car.image;
  document.getElementById("saveButton").textContent = "Save Changes";
  window.scrollTo({top: 0, behavior: "smooth"});
}
function deleteCar(id) {
  if (!confirm("Delete this car?")) return;
  saveCars(getCars().filter(function(car) { return car.id !== id; }));
  clearForm();
  renderCars();
}
const carForm = document.getElementById("carForm");
if (carForm) {
  carForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const cars = getCars();
    const id = document.getElementById("editId").value;
    const car = {
      id: id || String(Date.now()),
      name: document.getElementById("carName").value.trim(),
      brand: document.getElementById("carBrand").value.trim(),
      year: Number(document.getElementById("carYear").value),
      image: document.getElementById("carImage").value.trim()
    };
    if (!car.name || !car.brand || car.year < 1950 || car.year > 2035) return;
    if (id) {
      const index = cars.findIndex(function(item) { return item.id === id; });
      if (index !== -1) cars[index] = car;
      else cars.push(car);
    } else {
      cars.push(car);
    }
    try {
      saveCars(cars);
      clearForm();
      renderCars();
    } catch (error) {
      alert("Could not save. Please check your browser storage settings.");
    }
  });
  document.getElementById("cancelButton").addEventListener("click", clearForm);
}
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function(event) {
    event.preventDefault();
    document.getElementById("contactStatus").textContent = "Message Send Sucessfully 😊";
    contactForm.reset();
  });
}
renderCars();
