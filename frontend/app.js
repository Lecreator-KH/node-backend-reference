const API_BASE = 'https://psychic-space-fortnight-g7xqgv9rqp6c9ggw-3000.app.github.dev'; // change if different
let table;

function actionButtons(id) {
  return `<button class="btn btn-sm btn-outline-secondary me-1 edit" data-id="${id}">Edit</button>
          <button class="btn btn-sm btn-outline-danger delete" data-id="${id}">Delete</button>`;
}

function initTableWithStatic() {
  const staticRows = [
    { id: 1, name: 'Sushi Star', cuisine: 'Japanese', rating: 5 },
    { id: 2, name: 'Bella Pasta', cuisine: 'Italian', rating: 4 }
  ];
  const rows = staticRows.map(r => [r.name, r.cuisine, r.rating, actionButtons(r.id)]);
  table = new DataTable('#restaurantsTable', { data: rows });
}

async function fetchRestaurants() {
  const res = await fetch(`${API_BASE}/restaurants`);
  if (!res.ok) throw new Error('Failed to load restaurants');
  return await res.json();
}
async function initTableFromApi() {
  const data = await fetchRestaurants();
  const rows = data.map(r => [r.name, r.cuisine, r.rating, actionButtons(r.id)]);
  if (table) table.destroy();
  table = new DataTable('#restaurantsTable', { data: rows });
}

// Select form
const createForm = document.getElementById('createForm');

// Backend API URL
const API_URL = 'https://psychic-space-fortnight-g7xqgv9rqp6c9ggw-3000.app.github.dev/restaurants'; // replace with your backend URL

// Handle form submission
createForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // prevent page reload

  // Get form values
  const name = document.getElementById('name').value.trim();
  const cuisine = document.getElementById('cuisine').value.trim();
  const rating = parseInt(document.getElementById('rating').value, 10);

  // Validate inputs
  if (!name || !cuisine || isNaN(rating)) {
    alert('Please fill out all fields correctly!');
    return;
  }

  const payload = { name, cuisine, rating };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle backend validation errors
      alert(data.error || 'Failed to add restaurant');
      return;
    }

    // Reset the form
    // createForm.reset();
    window.location.reload(); // reloads the page to refresh table
  } catch (err) {
    console.error('Error calling API:', err);
    alert('Error connecting to the backend.');
  }
});

const tableBody = document.querySelector('#restaurantsTable tbody');

// Event delegation for dynamically created buttons
tableBody.addEventListener('click', async (event) => {
  const button = event.target;

  // Handle Delete button
  if (button.classList.contains('delete')) {
    const id = button.getAttribute('data-id');
    if (!id) return;

    const confirmed = confirm('Are you sure you want to delete this restaurant?');
    if (!confirmed) return;

    try {
      const response = await fetch(`https://psychic-space-fortnight-g7xqgv9rqp6c9ggw-3000.app.github.dev/restaurants/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to delete restaurant');
        return;
      }

      console.log('Deleted restaurant:', data);
      button.closest('tr').remove();
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      alert('Error connecting to backend.');
    }
  }

  // Edit button
  if (button.classList.contains('edit')) {
    const id = button.getAttribute('data-id');
    if (!id) return;

    // Get current row values
    const row = button.closest('tr');
    const currentName = row.children[0].textContent;
    const currentCuisine = row.children[1].textContent;
    const currentRating = row.children[2].textContent;

    // Prompt user for new values (simple example)
    const name = prompt('Name:', currentName);
    const cuisine = prompt('Cuisine:', currentCuisine);
    const rating = parseInt(prompt('Rating (1–5):', currentRating), 10);

    if (!name || !cuisine || isNaN(rating)) {
      alert('All fields are required and rating must be a number.');
      return;
    }

    try {
      const response = await fetch(`https://psychic-space-fortnight-g7xqgv9rqp6c9ggw-3000.app.github.dev/restaurants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, cuisine, rating })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Failed to update restaurant');
        return;
      }

      console.log('Updated restaurant:', data);

      // Update table row with new data
      row.children[0].textContent = data.name;
      row.children[1].textContent = data.cuisine;
      row.children[2].textContent = data.rating;

    } catch (err) {
      console.error(err);
      alert('Error connecting to backend.');
    }
  }
});



document.addEventListener('DOMContentLoaded', initTableFromApi);
// document.addEventListener('DOMContentLoaded', initTableWithStatic);