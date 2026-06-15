/**
 * Edit Plan Page - Journey Travel Planner
 * Pre-fills form from localStorage and submits PATCH to update the plan.
 */

const API_BASE_URL = "https://journey-ai-travel-planner.onrender.com";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
(function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';
})();

// ─── DOM References ───────────────────────────────────────────────────────────
const userEmailEl         = document.getElementById('userEmail');
const logoutBtn           = document.getElementById('logoutBtn');
const loadingSpinner      = document.getElementById('loadingSpinner');
const errorMessage        = document.getElementById('errorMessage');
const editPlanForm        = document.getElementById('editPlanForm');
const updatePlanBtn       = document.getElementById('updatePlanBtn');

// Form fields
const budgetSelect        = document.getElementById('budgetSelect');
const durationInput       = document.getElementById('durationInput');
const travelTypeInput     = document.getElementById('travelTypeInput');
const accommodationInput  = document.getElementById('accommodationInput');
const interestsInput      = document.getElementById('interestsInput');
const customRequirementsInput = document.getElementById('customRequirementsInput');

// Updated plan modal
const updatedPlanModal    = document.getElementById('updatedPlanModal');
const planContent         = document.getElementById('planContent');
const planBackdrop        = document.getElementById('planBackdrop');
const planModalClose      = document.getElementById('planModalClose');
const closeModalBtn       = document.getElementById('closeModalBtn');
const backToProfileBtn    = document.getElementById('backToProfileBtn');

// ─── State ────────────────────────────────────────────────────────────────────
let currentPlan = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getToken() {
    return localStorage.getItem('token');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
    };
}

function handleUnauthorized() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

function getUserEmail() {
    const token = getToken();
    if (!token) return '';
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.email || '';
    } catch {
        return '';
    }
}

function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
    updatePlanBtn.disabled = show;
    updatePlanBtn.textContent = show ? 'Updating...' : 'Update Plan';
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// ─── Pre-fill Form ────────────────────────────────────────────────────────────
function prefillForm(plan) {
    // Budget dropdown
    if (plan.budget) {
        const opt = [...budgetSelect.options].find(
            o => o.value.toLowerCase() === plan.budget.toLowerCase()
        );
        if (opt) budgetSelect.value = opt.value;
    }

    if (plan.duration) durationInput.value = plan.duration;
    if (plan.travel_type) travelTypeInput.value = plan.travel_type;
    if (plan.accommodation) accommodationInput.value = plan.accommodation;

    // interests can be array or string
    if (plan.interests) {
        interestsInput.value = Array.isArray(plan.interests)
            ? plan.interests.join(', ')
            : plan.interests;
    }

    if (plan.custom_requirements) {
        customRequirementsInput.value = plan.custom_requirements;
    }
}

// ─── Submit Update ────────────────────────────────────────────────────────────
async function handleUpdate(e) {
    e.preventDefault();
    hideError();

    if (!currentPlan) {
        showError('No plan loaded. Please go back to your profile.');
        return;
    }

    // Build interests array from comma-separated input
    const interestsRaw = interestsInput.value.trim();
    const interestsArr = interestsRaw
        ? interestsRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const payload = {
        budget: budgetSelect.value,
        duration: parseInt(durationInput.value, 10) || null,
        travel_type: travelTypeInput.value.trim(),
        accommodation: accommodationInput.value.trim(),
        interests: interestsArr,
        custom_requirements: customRequirementsInput.value.trim()
    };

    showLoading(true);

    try {
        const res = await fetch(`${API_BASE_URL}/plans/${currentPlan.id}`, {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify(payload)
        });

        if (res.status === 401) { handleUnauthorized(); return; }

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            // Backend validation errors
            if (data.detail) {
                if (Array.isArray(data.detail)) {
                    showError(data.detail.map(e => e.msg || JSON.stringify(e)).join(' | '));
                } else {
                    showError(data.detail);
                }
            } else {
                showError('Failed to update plan. Please try again.');
            }
            return;
        }

        // Show generated plan modal
        planContent.textContent = data.generated_plan || 'Plan updated successfully.';
        openPlanModal();
    } catch (e) {
        showError('Network error. Please check your connection and try again.');
    } finally {
        showLoading(false);
    }
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function openPlanModal() {
    updatedPlanModal.classList.add('show');
    updatedPlanModal.style.display = 'flex';
}

function closePlanModal() {
    updatedPlanModal.classList.remove('show');
    updatedPlanModal.style.display = 'none';
}

// ─── Event Listeners ──────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

editPlanForm.addEventListener('submit', handleUpdate);

planModalClose.addEventListener('click', closePlanModal);
planBackdrop.addEventListener('click', closePlanModal);
closeModalBtn.addEventListener('click', closePlanModal);
backToProfileBtn.addEventListener('click', () => {
    window.location.href = 'profile.html';
});

// ─── Init ─────────────────────────────────────────────────────────────────────
(function init() {
    // Set email in navbar
    userEmailEl.textContent = getUserEmail();

    // Load plan from localStorage
    const raw = localStorage.getItem('selectedPlan');
    if (!raw) {
        showError('No plan selected. Redirecting to profile...');
        setTimeout(() => window.location.href = 'profile.html', 2000);
        return;
    }

    try {
        currentPlan = JSON.parse(raw);
        prefillForm(currentPlan);
    } catch {
        showError('Could not load plan data. Redirecting to profile...');
        setTimeout(() => window.location.href = 'profile.html', 2000);
    }
})();
