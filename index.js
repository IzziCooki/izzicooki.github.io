// Define the Project interface for type safety (though not strictly enforced in plain JS)
// interface Project {
//   title: string;
//   desc: string;
//   image: string;
//   link: string;
//   details: string;
// }

let currentPage = 1;
const projectsPerPage = 3; // Number of projects to display per page
let projectData = []; // Array to hold all project data

/**
 * Fetches project data from data.json.
 * Handles potential network errors and displays a message if data loading fails.
 */
function fetchProjects() {
  fetch('data.json')
    .then(response => {
      // Check if the network response was successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json(); // Parse the JSON response
    })
    .then(data => {
      projectData = data; // Store the fetched project data
      renderProjects(); // Render the projects on the page
    })
    .catch(error => {
      console.error('Error loading project data:', error);
      const container = document.querySelector('.projects-grid');
      if (container) {
        // Display an error message to the user
        container.innerHTML = '<p class="text-red-500 text-center p-4 rounded-md bg-red-900 bg-opacity-20">Failed to load projects. Please try again later.</p>';
      }
    });
}

/**
 * Renders the projects on the page based on the current page.
 * Clears existing projects and appends new ones.
 */
function renderProjects() {
  const container = document.querySelector('.projects-grid');
  if (!container) {
    console.error('Projects container not found');
    return;
  }
  container.innerHTML = ''; // Clear existing project cards

  // Calculate the start and end indices for the current page's projects
  const start = (currentPage - 1) * projectsPerPage;
  const end = start + projectsPerPage;
  const currentProjects = projectData.slice(start, end);

  // Create and append a card for each project
  currentProjects.forEach((proj, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';
    // Add a slight animation delay for a staggered effect
    card.style.animationDelay = `${i * 0.1}s`; // Adjusted delay for smoother animation
    card.innerHTML = `
      <img src="${proj.image}" alt="${proj.title}" class="w-full h-48 object-cover rounded-lg mb-4" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/400x250/272744/A0A0B0?text=Image+Not+Found';" />
      <h3 class="text-xl font-semibold text-light-highlight mb-2">${proj.title}</h3>
      <p class="text-muted-text text-sm">${proj.desc}</p>
    `;
    container.appendChild(card);
  });

  updatePaginationButtons(); // Update the state of pagination buttons
}

/**
 * Updates the disabled state of the "Prev" and "Next" pagination buttons.
 */
function updatePaginationButtons() {
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');

  if (prevButton) {
    prevButton.disabled = currentPage === 1; // Disable 'Prev' if on the first page
  }
  if (nextButton) {
    nextButton.disabled = currentPage * projectsPerPage >= projectData.length; // Disable 'Next' if on the last page
  }
}

/**
 * Sets up event listeners for the pagination buttons.
 */
function setupPagination() {
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderProjects();
      }
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentPage * projectsPerPage < projectData.length) {
        currentPage++;
        renderProjects();
      }
    });
  }
}

/**
 * Opens the project details popup with the given project information.
 * Locks body scroll when the popup is active.
 * @param {string} title - The title of the project.
 * @param {string} details - The detailed description of the project.
 * @param {string} link - The link to the project.
 * @param {string} image - The image URL for the project.
 */
function openProjectPopup(title, details, link, image) {
  const popup = document.getElementById('project-modal');
  const popupTitle = document.getElementById('popup-title');
  const popupDesc = document.getElementById('popup-desc');
  const popupImageLink = document.getElementById('popup-image-link');
  const popupImage = document.getElementById('popup-image');
  const popupProjectLink = document.getElementById('popup-project-link');

  if (!popup || !popupTitle || !popupDesc || !popupImage || !popupImageLink || !popupProjectLink) {
    console.error('One or more popup elements not found');
    return;
  }

  // Populate popup content
  popupTitle.textContent = title;
  popupDesc.textContent = details;
  popupImage.src = image;
  popupImage.alt = title;
  popupImageLink.href = link;
  popupProjectLink.href = link;

  // Show the popup and add 'active' class for animation
  popup.classList.remove('hidden');
  setTimeout(() => { // Small delay to allow 'display' change before transition
    popup.querySelector('.modal-content').classList.add('active');
  }, 10);

  // Lock scroll on the body
  document.body.style.overflow = 'hidden';
}

/**
 * Closes the project details popup.
 * Unlocks body scroll when the popup is closed.
 */
function closeProjectPopup() {
  const popup = document.getElementById('project-modal');
  const modalContent = popup ? popup.querySelector('.modal-content') : null;

  if (popup && modalContent) {
    modalContent.classList.remove('active');
    // Hide the popup after the transition completes
    modalContent.addEventListener('transitionend', () => {
      popup.classList.add('hidden');
    }, { once: true }); // Ensure the event listener is removed after first use

    // Unlock scroll on the body
    document.body.style.overflow = '';
  }
}

/**
 * Handles the submission of the contact form.
 * Displays status messages (sending, success, error).
 * @param {Event} event - The form submission event.
 */
function handleFormSubmit(event) {
  event.preventDefault(); // Prevent default form submission
  const form = event.target;
  const statusDiv = document.getElementById('form-status');

  if (!statusDiv) {
    console.error('Form status div not found');
    return;
  }

  statusDiv.textContent = 'Sending message...';
  statusDiv.className = 'form-status sending'; // Apply sending style

  // Use fetch API to submit form data
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Parse JSON response from Web3Forms
  })
  .then(data => {
    // Web3Forms sends a 'success' property in the response
    if (data.success) {
      statusDiv.textContent = 'Message sent successfully!';
      statusDiv.className = 'form-status success'; // Apply success style
      form.reset(); // Clear the form fields
    } else {
      // Handle non-successful responses from Web3Forms (e.g., botcheck failed)
      statusDiv.textContent = data.message || 'Failed to send message. Please try again.';
      statusDiv.className = 'form-status error'; // Apply error style
    }
  })
  .catch(error => {
    console.error('Error:', error);
    // Display a generic error message for network/other issues
    statusDiv.textContent = 'An error occurred. Message could not be sent.';
    statusDiv.className = 'form-status error'; // Apply error style
  });
}

// Intersection Observer for section animations
const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            // Add 'visible' class when section enters viewport
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Optionally remove 'visible' if you want re-animation on scroll back up
                // entry.target.classList.remove('visible');
            }
        });
    },
    {
        root: null, // Use the viewport as the root
        threshold: 0.1, // Trigger when 10% of the section is visible
        rootMargin: '0px'
    }
);

/**
 * Initializes all necessary event listeners and fetches data when the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  fetchProjects(); // Load project data and render them
  setupPagination(); // Set up pagination button functionality

  // Event listener for clicking on project cards to open the popup
  const projectsContainer = document.querySelector('.projects-grid');
  projectsContainer?.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card'); // Find the closest project card
    if (!card) return; // If no project card was clicked, do nothing

    // Get the title from the clicked card
    const titleElement = card.querySelector('h3');
    const clickedTitle = titleElement ? titleElement.textContent.trim() : '';

    // Find the corresponding project data
    const project = projectData.find(p => p.title === clickedTitle);
    if (project) {
      openProjectPopup(project.title, project.details, project.link, project.image);
    }
  });

  // Event listener for closing the project popup
  const closeBtn = document.querySelector('.modal-close-button');
  closeBtn?.addEventListener('click', closeProjectPopup);

  // Event listener for closing the popup when clicking outside the content
  const projectModalOverlay = document.getElementById('project-modal');
  projectModalOverlay?.addEventListener('click', (e) => {
    if (e.target === projectModalOverlay) { // Only close if the overlay itself is clicked
      closeProjectPopup();
    }
  });

  // Event listener for contact form submission
  const contactForm = document.querySelector('.contact-form');
  contactForm?.addEventListener('submit', handleFormSubmit);

  // Observe all sections for animation on scroll
  document.querySelectorAll('.section-container').forEach(section => {
    sectionObserver.observe(section);
  });

  // Smooth scroll for header navigation links
  document.querySelectorAll('header nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault(); // Prevent default anchor click behavior

      const targetId = this.getAttribute('href'); // Get the href (e.g., "#projects")
      const targetElement = document.querySelector(targetId); // Find the element

      if (targetElement) {
        // Scroll to the target element
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start' // Align the top of the element with the top of the viewport
        });
      }
    });
  });
});
