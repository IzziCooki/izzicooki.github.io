"use strict";

var currentPage = 1;
var projectsPerPage = 3;
var projectData = [];
function fetchProjects() {
  fetch('data.json').then(function (response) {
    if (!response.ok) {
      throw new Error("HTTP error! status: ".concat(response.status));
    }
    return response.json();
  }).then(function (data) {
    projectData = data;
    renderProjects();
  }).catch(function (error) {
    console.error('Error loading project data:', error);
    var container = document.querySelector('.projects');
    if (container) {
      container.innerHTML = '<p class="error-message">Failed to load projects. Please try again later.</p>';
    }
  });
}
function renderProjects() {
  var container = document.querySelector('.projects');
  if (!container) {
    console.error('Projects container not found');
    return;
  }
  container.innerHTML = '';
  var start = (currentPage - 1) * projectsPerPage;
  var end = start + projectsPerPage;
  var currentProjects = projectData.slice(start, end);
  currentProjects.forEach(function (proj, i) {
    var card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = "".concat(i * 0.2, "s");
    card.innerHTML = "\n      <img src=\"".concat(proj.image, "\" alt=\"").concat(proj.title, "\" class=\"project-image\" loading=\"lazy\" />\n      <h3>").concat(proj.title, "</h3>\n      <p>").concat(proj.desc, "</p>\n    ");
    container.appendChild(card);
  });
  updatePaginationButtons();
}
function updatePaginationButtons() {
  var prevButton = document.querySelector('.pagination button:first-child');
  var nextButton = document.querySelector('.pagination button:last-child');
  if (prevButton) {
    prevButton.disabled = currentPage === 1;
  }
  if (nextButton) {
    nextButton.disabled = currentPage * projectsPerPage >= projectData.length;
  }
}
function setupPagination() {
  var pagination = document.querySelector('.pagination');
  if (!pagination) {
    console.error('Pagination container not found');
    return;
  }
  pagination.addEventListener('click', function (e) {
    var target = e.target;
    if (!target || !target.textContent) return;
    if (target.textContent.includes('Next') && currentPage * projectsPerPage < projectData.length) {
      currentPage++;
      renderProjects();
    }
    if (target.textContent.includes('Prev') && currentPage > 1) {
      currentPage--;
      renderProjects();
    }
  });
}
function openProjectPopup(title, details, link, image) {
  var popup = document.getElementById('project-modal');
  var popupTitle = document.getElementById('popup-title');
  var popupDesc = document.getElementById('popup-desc');
  var popupImageLink = document.getElementById('popup-image-link');
  var popupImage = document.getElementById('popup-image');
  if (!popup || !popupTitle || !popupDesc || !popupImage || !popupImageLink) {
    console.error('Popup elements not found');
    return;
  }

  // Lock scroll
  document.body.style.overflow = 'hidden';
  popupTitle.textContent = title;
  popupDesc.textContent = details;
  popupImage.src = image;
  popupImage.alt = title;
  popupImageLink.href = link;
  popupImageLink.target = "_blank";
  popup.classList.add('active');
}
function closeProjectPopup() {
  var popup = document.getElementById('project-modal');
  if (popup) {
    popup.classList.remove('active');
    // Unlock scroll
    document.body.style.overflow = '';
  }
}
function handleFormSubmit(event) {
  event.preventDefault();
  var form = event.target;
  var statusDiv = document.getElementById('form-status');
  if (!statusDiv) return;
  statusDiv.textContent = 'Sending message...';
  statusDiv.className = 'form-status sending';
  fetch(form.action, {
    method: 'POST',
    body: new FormData(form)
  }).then(function (response) {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    statusDiv.textContent = 'Message sent successfully!';
    statusDiv.className = 'form-status success';
    form.reset();
  }).catch(function (error) {
    console.error('Error:', error);
    statusDiv.textContent = 'Message sent successfully';
    statusDiv.className = 'form-status success';
  });
}
document.addEventListener('DOMContentLoaded', function () {
  fetchProjects();
  setupPagination();
  var projectsContainer = document.querySelector('.projects');
  projectsContainer === null || projectsContainer === void 0 || projectsContainer.addEventListener('click', function (e) {
    var _card$querySelector;
    var card = e.target.closest('.project-card');
    if (!card) return;
    var title = ((_card$querySelector = card.querySelector('h3')) === null || _card$querySelector === void 0 ? void 0 : _card$querySelector.textContent) || '';
    var clickedTitle = title.trim();
    var project = projectData.find(function (p) {
      return p.title === clickedTitle;
    });
    if (project) {
      openProjectPopup(project.title, project.details, project.link, project.image);
    }
  });
  var closeBtn = document.getElementById('popup-close');
  closeBtn === null || closeBtn === void 0 || closeBtn.addEventListener('click', closeProjectPopup);
  var contactForm = document.querySelector('.contact-form');
  contactForm === null || contactForm === void 0 || contactForm.addEventListener('submit', handleFormSubmit);
});