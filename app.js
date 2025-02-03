const form = document.querySelector("#entryForm");
const table = document.querySelector("#gameList");
const submitButton = form.querySelector("button[type='submit']");
let editingRow = null;

document.addEventListener("DOMContentLoaded", () => {
  loadGames();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form.checkValidity()) {
    e.stopPropagation();
    form.classList.add("was-validated");
    return;
  }

  const { title, year, genre, platform, rating } = e.target.elements;

  if (editingRow) {
    // Update existing row
    const fields = [title, year, genre, platform, rating];
    fields.forEach((field, index) => {
      editingRow.children[index].textContent = field.value;
    });
    editingRow = null; // Reset editing state
    submitButton.textContent = "Submit"; // Reset button text
  } else {
    // Add new row
    const row = createRow(
      title.value,
      year.value,
      genre.value,
      platform.value,
      rating.value
    );
    table.appendChild(row);
  }

  saveGames();
  updateEmptyMessage();
  form.classList.remove("was-validated");
  form.reset();
});

function createRow(title, year, genre, platform, rating) {
  const row = document.createElement("tr");
  row.dataset.addedTime = new Date().toISOString(); // Store the add time
  row.innerHTML = `
    <td>${title}</td>
    <td>${year}</td>
    <td>${genre}</td>
    <td>${platform}</td>
    <td>${rating}</td>
    <td>
      <button class="btn btn-sm btn-danger"><i class="bi bi-trash" aria-label="Delete"></i></button>
      <button class="btn btn-sm btn-warning"><i class="bi bi-pencil" aria-label="Edit"></i></button>
    </td>
  `;
  return row;
}

// TABLE LISTENER
table.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("btn-danger") ||
    e.target.closest(".btn-danger")
  ) {
    if (confirm("Are you sure you want to delete this game?")) {
      const row = e.target.closest("tr");
      row.classList.add("removing");
      setTimeout(() => {
        row.remove();
        saveGames();
        updateEmptyMessage();
      }, 300);
    }
  }

  if (
    e.target.classList.contains("btn-warning") ||
    e.target.closest(".btn-warning")
  ) {
    editingRow = e.target.closest("tr");
    const fields = ["title", "year", "genre", "platform", "rating"];

    fields.forEach((field, index) => {
      document.querySelector(`#${field}`).value =
        editingRow.children[index].textContent;
    });

    submitButton.textContent = "Update";
  }
});

function updateEmptyMessage() {
  const emptyMessage = document.querySelector("#emptyMessage");
  if (table.querySelectorAll("tr").length > 1) {
    emptyMessage.style.display = "none";
  } else {
    emptyMessage.style.display = "table-row";
  }
}

// DARK MODE
const darkModeToggle = document.querySelector("#darkModeToggle");
const darkModeIcon = darkModeToggle.querySelector("i");

if (localStorage.getItem("darkMode") === "enabled") {
  document.body.classList.add("dark-mode");
  darkModeIcon.classList.remove("bi-moon");
  darkModeIcon.classList.add("bi-brightness-high");
  darkModeToggle.classList.remove("btn-secondary");
  darkModeToggle.classList.add("btn-light");
}

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    darkModeIcon.classList.remove("bi-moon");
    darkModeIcon.classList.add("bi-brightness-high");
    darkModeToggle.classList.remove("btn-secondary");
    darkModeToggle.classList.add("btn-light");
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkModeIcon.classList.remove("bi-brightness-high");
    darkModeIcon.classList.add("bi-moon");
    darkModeToggle.classList.remove("btn-light");
    darkModeToggle.classList.add("btn-secondary");
  }
});

// SAVING AND LOADING LOCALLY
function saveGames() {
  const games = [];
  table.querySelectorAll("tr").forEach((row, index) => {
    if (index === 0) return; // Skip the header row
    games.push({
      title: row.children[0].textContent,
      year: row.children[1].textContent,
      genre: row.children[2].textContent,
      platform: row.children[3].textContent,
      rating: row.children[4].textContent,
    });
  });
  localStorage.setItem("games", JSON.stringify(games));
}

function loadGames() {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  games.forEach((game) => {
    const row = createRow(
      game.title,
      game.year,
      game.genre,
      game.platform,
      game.rating
    );
    table.appendChild(row);
  });
  updateEmptyMessage();
}

const tableHeaders = document.querySelectorAll("thead th");

// Add click event listeners to each header
tableHeaders.forEach((header, index) => {
  //Skip the last column
  if (index < tableHeaders.length - 1) {
    header.addEventListener("click", () => {
      const isAscending = header.dataset.sorted === "asc";
      sortTable(index, !isAscending);
      updateHeaderState(header, !isAscending);
    });
  }
});

function sortTable(columnIndex, ascending) {
  const rows = Array.from(table.querySelectorAll("tr")).slice(1); // Exclude header row
  rows.sort((a, b) => {
    const aText = a.children[columnIndex].textContent.trim();
    const bText = b.children[columnIndex].textContent.trim();

    //numeric sorting
    if (!isNaN(aText) && !isNaN(bText)) {
      return ascending ? aText - bText : bText - aText;
    }

    //string sorting
    return ascending ? aText.localeCompare(bText) : bText.localeCompare(aText);
  });

  // Reattach sorted rows to the table
  rows.forEach((row) => table.appendChild(row));
}

function updateHeaderState(activeHeader, isAscending) {
  tableHeaders.forEach((header) => {
    header.dataset.sorted = ""; // Reset all headers
  });
  activeHeader.dataset.sorted = isAscending ? "asc" : "desc"; // Set active header
}
