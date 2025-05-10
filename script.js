// Get dropdown elements
const exploreDropdown = document.querySelector('.header2 .dropdown .dropdown-toggle');
const exploreMenu = document.querySelector('.header2 .dropdown .dropdown-menu');

const threeDots = document.querySelector('.three-dots');
const threeDotsMenu = document.querySelector('.three-dots + .dropdown-menu');

// Toggle explore dropdown visibility
exploreDropdown.addEventListener('click', function(event) {
  event.preventDefault();
  exploreMenu.classList.toggle('show');
});

// Toggle three dots dropdown visibility
threeDots.addEventListener('click', function(event) {
  event.preventDefault();
  threeDotsMenu.classList.toggle('show');
});