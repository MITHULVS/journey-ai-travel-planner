// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// ========================================
// JWT AUTHENTICATION SETUP
// ========================================
// JWT token is automatically sent with all requests via getAuthHeaders()
// The getAuthHeaders() function from auth.js adds:
// Authorization: Bearer {token}
// This works for ALL protected routes:
// - GET /places/ - Load destinations
// - POST /plans/ - Create travel plan
// ========================================

// State Management
let currentPage = 1;
let currentLimit = 6;
let allFilters = {};
let selectedPlaceId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set body class for home page styling
    document.body.classList.add('home-page');
    
    // Initialize banner carousel
    initializeBannerCarousel();
    
    // Load initial destinations
    loadDestinations();
    
    // Attach event listeners
    attachEventListeners();
});

// ========================================
// BANNER CAROUSEL
// ========================================
let carouselIndex = 0;
let carouselInterval = null;

function initializeBannerCarousel() {
    const bannerImages = document.querySelectorAll('.banner-image');
    
    // Only start carousel if there are multiple images
    if (bannerImages.length > 1) {
        carouselInterval = setInterval(() => {
            rotateBannerImage();
        }, 5000); // Change image every 5 seconds
    }
}

function rotateBannerImage() {
    const bannerImages = document.querySelectorAll('.banner-image');
    
    if (bannerImages.length === 0) return;
    
    // Remove active class from current image
    bannerImages[carouselIndex].classList.remove('active');
    
    // Move to next image
    carouselIndex = (carouselIndex + 1) % bannerImages.length;
    
    // Add active class to next image
    bannerImages[carouselIndex].classList.add('active');
}

// ========================================
// AUTHENTICATION
// ========================================
function logout() {
    removeToken(); // Remove JWT from localStorage
    window.location.href = 'index.html';
}

function goToProfile() {
    // Redirect to profile page (to be implemented)
    window.location.href = 'profile.html';
}

// ========================================
// EVENT LISTENERS
// ========================================
function attachEventListeners() {
    // Navigation buttons
    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('profileBtn').addEventListener('click', goToProfile);
    
    // Filter buttons
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
    
    // Search
    document.getElementById('searchBtn').addEventListener('click', performSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Pagination
    document.getElementById('prevBtn').addEventListener('click', previousPage);
    document.getElementById('nextBtn').addEventListener('click', nextPage);
    
    // Destination modal
    document.getElementById('destinationBackdrop').addEventListener('click', closeDestinationModal);
    document.getElementById('destinationModalClose').addEventListener('click', closeDestinationModal);
    
    // Plan form
    document.getElementById('travelPlanForm').addEventListener('submit', handleCreatePlan);
    
    // Generated plan modal
    document.getElementById('planBackdrop').addEventListener('click', closeGeneratedPlanModal);
    document.getElementById('planModalClose').addEventListener('click', closeGeneratedPlanModal);
    document.getElementById('closePlanBtn').addEventListener('click', closeGeneratedPlanModal);
    document.getElementById('saveContinueBtn').addEventListener('click', closeGeneratedPlanModal);
}

// ========================================
// FILTER MANAGEMENT
// ========================================
function applyFilters() {
    // Build filter object
    const continent = document.getElementById('continentSelect').value;
    const isBeach = document.getElementById('beachFilter').checked;
    const isParty = document.getElementById('partyFilter').checked;
    const isMetro = document.getElementById('metroFilter').checked;
    const isNature = document.getElementById('natureFilter').checked;
    const isFamily = document.getElementById('familyFilter').checked;
    
    allFilters = {};
    if (continent) allFilters.continent = continent;
    if (isBeach) allFilters.is_beach = true;
    if (isParty) allFilters.is_party = true;
    if (isMetro) allFilters.is_metro = true;
    if (isNature) allFilters.is_nature = true;
    if (isFamily) allFilters.is_family_friendly = true;
    
    currentPage = 1; // Reset to first page
    loadDestinations();
}

function resetFilters() {
    // Clear all filter inputs
    document.getElementById('continentSelect').value = '';
    document.getElementById('beachFilter').checked = false;
    document.getElementById('partyFilter').checked = false;
    document.getElementById('metroFilter').checked = false;
    document.getElementById('natureFilter').checked = false;
    document.getElementById('familyFilter').checked = false;
    document.getElementById('searchInput').value = '';
    
    allFilters = {};
    currentPage = 1;
    loadDestinations();
}

// ========================================
// SEARCH
// ========================================
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    
    allFilters = {};
    if (searchTerm) {
        allFilters.search = searchTerm;
    }
    
    currentPage = 1; // Reset to first page
    loadDestinations();
}

// ========================================
// LOAD DESTINATIONS
// ========================================
async function loadDestinations() {
    showLoadingSpinner(true);
    hideErrorMessage();
    
    try {
        // Build query parameters
        const params = new URLSearchParams();
        params.append('page', currentPage);
        params.append('limit', currentLimit);
        
        // Add filters
        Object.entries(allFilters).forEach(([key, value]) => {
            params.append(key, value);
        });
        
        const response = await fetch(`${API_BASE_URL}/places/?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load destinations');
        }
        
        const data = await response.json();
        
        if (!data.data || data.data.length === 0) {
            showErrorMessage('No destinations found');
            document.getElementById('destinationsGrid').innerHTML = '';
            updatePaginationButtons(data);
            showLoadingSpinner(false);
            return;
        }
        
        // Render destination cards
        renderDestinations(data.data);
        
        // Update pagination
        updatePaginationButtons(data);
        
        showLoadingSpinner(false);
    } catch (error) {
        console.error('Error loading destinations:', error);
        console.error('API URL attempted:', `${API_BASE_URL}/places/`);
        console.error('Full error details:', {
            message: error.message,
            stack: error.stack
        });
        showErrorMessage('Failed to load destinations. Make sure backend is running on http://localhost:8000');
        showLoadingSpinner(false);
    }
}

// ========================================
// RENDER DESTINATIONS
// ========================================
function renderDestinations(destinations) {
    const grid = document.getElementById('destinationsGrid');
    grid.innerHTML = '';
    
    destinations.forEach(destination => {
        const card = document.createElement('div');
        card.className = 'destination-card';
        card.innerHTML = `
            <img src="${destination.image_url}" alt="${destination.name}" class="destination-card-image">
            <div class="destination-card-content">
                <h3 class="destination-card-name">${destination.name}</h3>
                <p class="destination-card-continent">${destination.continent}</p>
                <div class="destination-tags">
                    ${destination.is_beach ? '<span class="tag">Beach</span>' : ''}
                    ${destination.is_party ? '<span class="tag">Party</span>' : ''}
                    ${destination.is_metro ? '<span class="tag">Metro</span>' : ''}
                    ${destination.is_nature ? '<span class="tag">Nature</span>' : ''}
                    ${destination.is_family_friendly ? '<span class="tag">Family Friendly</span>' : ''}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            openDestinationModal(destination);
        });
        
        grid.appendChild(card);
    });
}

// ========================================
// PAGINATION
// ========================================
function updatePaginationButtons(data) {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageInfo = document.getElementById('pageInfo');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = data.data.length < currentLimit;
    pageInfo.textContent = `Page ${currentPage}`;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadDestinations();
    }
}

function nextPage() {
    currentPage++;
    loadDestinations();
}

// ========================================
// MODALS - DESTINATION DETAILS
// ========================================
function openDestinationModal(destination) {
    selectedPlaceId = destination.id;
    
    // Populate modal
    document.getElementById('destinationName').textContent = destination.name;
    document.getElementById('destinationImage').src = destination.image_url;
    document.getElementById('destinationImage').alt = destination.name;
    
    // Reset form
    document.getElementById('travelPlanForm').reset();
    document.getElementById('formError').style.display = 'none';
    
    // Show modal with flex display for proper centering
    const modal = document.getElementById('destinationModal');
    modal.style.display = 'flex';
}

function closeDestinationModal() {
    const modal = document.getElementById('destinationModal');
    modal.style.display = 'none';
    selectedPlaceId = null;
    document.getElementById('travelPlanForm').reset();
}

// ========================================
// CREATE TRAVEL PLAN
// ========================================
async function handleCreatePlan(e) {
    e.preventDefault();
    
    if (!selectedPlaceId) {
        showFormError('Please select a destination');
        return;
    }
    
    // Get form values
    const budget = document.getElementById('budgetSelect').value;
    const duration = parseInt(document.getElementById('durationInput').value);
    const travelType = document.getElementById('travelTypeInput').value;
    const accommodation = document.getElementById('accommodationInput').value;
    const interests = document.getElementById('interestsInput').value
        .split(',')
        .map(i => i.trim())
        .filter(i => i);
    const customRequirements = document.getElementById('customRequirementsInput').value;
    
    // Validate
    if (!budget || !duration || !travelType || !accommodation || interests.length === 0) {
        showFormError('Please fill in all required fields');
        return;
    }
    
    // Show loading state
    const createBtn = document.getElementById('createPlanBtn');
    createBtn.disabled = true;
    createBtn.textContent = 'Creating Plan...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/plans/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                place_id: selectedPlaceId,
                budget: budget,
                duration: duration,
                travel_type: travelType,
                accommodation: accommodation,
                interests: interests,
                custom_requirements: customRequirements
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create plan');
        }
        
        const data = await response.json();
        
        // Close destination modal
        closeDestinationModal();
        
        // Show generated plan modal
        showGeneratedPlanModal(data.generated_plan);
        
    } catch (error) {
        console.error('Error creating plan:', error);
        showFormError('Failed to create travel plan. Please try again.');
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = 'Create Plan';
    }
}

function showFormError(message) {
    const errorDiv = document.getElementById('formError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// ========================================
// MODALS - GENERATED PLAN
// ========================================
function showGeneratedPlanModal(generatedPlan) {
    const planContent = document.getElementById('planContent');
    planContent.textContent = generatedPlan;
    
    const modal = document.getElementById('generatedPlanModal');
    modal.style.display = 'flex';
}

function closeGeneratedPlanModal() {
    const modal = document.getElementById('generatedPlanModal');
    modal.style.display = 'none';
    document.getElementById('planContent').textContent = '';
}

// ========================================
// LOADING & ERROR STATES
// ========================================
function showLoadingSpinner(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.style.display = 'flex';
    } else {
        spinner.style.display = 'none';
    }
}

function showErrorMessage(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideErrorMessage() {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
}
