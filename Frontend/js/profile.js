/**
 * Profile Page - Journey Travel Planner
 * Handles fetching, displaying, editing, and deleting travel plans.
 */

const API_BASE_URL = "http://localhost:8000";

// ─── Auth Guard ───────────────────────────────────────────────────────────────
(function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) window.location.href = 'index.html';
})();

// ─── DOM References ───────────────────────────────────────────────────────────
const userEmailEl      = document.getElementById('userEmail');
const profileEmailEl   = document.getElementById('profileEmail');
const totalPlansEl     = document.getElementById('totalPlans');
const loadingSpinner   = document.getElementById('loadingSpinner');
const errorMessage     = document.getElementById('errorMessage');
const noPlansMessage   = document.getElementById('noPlansMessage');
const plansGrid        = document.getElementById('plansGrid');
const logoutBtn        = document.getElementById('logoutBtn');

// Delete modal
const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const cancelDeleteBtn    = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn   = document.getElementById('confirmDeleteBtn');
const deleteBackdrop     = document.getElementById('deleteBackdrop');

// Toast
const successToast = document.getElementById('successToast');
const toastMessage = document.getElementById('toastMessage');

// ─── State ────────────────────────────────────────────────────────────────────
let plans = [];
let pendingDeleteId = null;
let pendingDeleteCard = null;
let toastTimeout = null;

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

function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function showToast(msg) {
    toastMessage.textContent = msg;
    successToast.style.display = 'block';
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        successToast.style.display = 'none';
    }, 3000);
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function emptyVal(val) {
    return !val || (typeof val === 'string' && val.trim() === '');
}

function displayValue(val) {
    return emptyVal(val) ? '<span class="detail-value empty">Not set</span>'
                         : `<span class="detail-value">${val}</span>`;
}

// ─── Fetch Email from token (decode JWT) ─────────────────────────────────────
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

// ─── Fetch Plans ──────────────────────────────────────────────────────────────
async function fetchPlans() {
    showLoading(true);
    hideError();
    noPlansMessage.style.display = 'none';
    plansGrid.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE_URL}/plans`, {
            headers: authHeaders()
        });

        if (res.status === 401) { handleUnauthorized(); return; }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showError(err.detail || 'Failed to load plans. Please try again.');
            showLoading(false);
            return;
        }

        plans = await res.json();
        renderPlans();
    } catch (e) {
        showError('Network error. Please check your connection and try again.');
    } finally {
        showLoading(false);
    }
}

// ─── Render Plans ─────────────────────────────────────────────────────────────
function renderPlans() {
    totalPlansEl.textContent = plans.length;
    plansGrid.innerHTML = '';

    if (plans.length === 0) {
        noPlansMessage.style.display = 'block';
        return;
    }

    noPlansMessage.style.display = 'none';

    plans.forEach(plan => {
        const card = buildPlanCard(plan);
        plansGrid.appendChild(card);
    });
}

function buildPlanCard(plan) {
    const card = document.createElement('div');
    card.className = 'plan-card';
    card.dataset.planId = plan.id;

    const interestsDisplay = Array.isArray(plan.interests)
        ? plan.interests.join(', ')
        : (plan.interests || '');

    card.innerHTML = `
        <div class="plan-card-header">
            <span class="plan-id">Plan #${plan.id}</span>
            <span class="plan-date">${formatDate(plan.created_at)}</span>
        </div>

        <div class="plan-details">
            <div class="detail-item">
                <span class="detail-label">Budget</span>
                ${displayValue(plan.budget)}
            </div>
            <div class="detail-item">
                <span class="detail-label">Duration</span>
                ${displayValue(plan.duration ? plan.duration + ' day(s)' : '')}
            </div>
            <div class="detail-item">
                <span class="detail-label">Travel Type</span>
                ${displayValue(plan.travel_type)}
            </div>
            <div class="detail-item">
                <span class="detail-label">Accommodation</span>
                ${displayValue(plan.accommodation)}
            </div>
            <div class="detail-item">
                <span class="detail-label">Interests</span>
                ${displayValue(interestsDisplay)}
            </div>
            <div class="detail-item">
                <span class="detail-label">Custom Requirements</span>
                ${displayValue(plan.custom_requirements)}
            </div>
        </div>

        <div class="plan-generated">
            <p class="plan-generated-title">Generated Plan</p>
            <pre class="plan-generated-content">${plan.generated_plan || 'No plan generated yet.'}</pre>
        </div>

        <div class="plan-actions">
            <button class="btn-plan-action btn-edit" data-id="${plan.id}">Edit</button>
            <button class="btn-plan-action btn-delete" data-id="${plan.id}">Delete</button>
        </div>
    `;

    card.querySelector('.btn-edit').addEventListener('click', () => handleEdit(plan));
    card.querySelector('.btn-delete').addEventListener('click', () => handleDeleteClick(plan.id, card));

    return card;
}

// ─── Edit ─────────────────────────────────────────────────────────────────────
function handleEdit(plan) {
    localStorage.setItem('selectedPlan', JSON.stringify(plan));
    window.location.href = 'edit-plan.html';
}

// ─── Delete ───────────────────────────────────────────────────────────────────
function handleDeleteClick(planId, card) {
    pendingDeleteId = planId;
    pendingDeleteCard = card;
    openDeleteModal();
}

function openDeleteModal() {
    deleteConfirmModal.classList.add('show');
    deleteConfirmModal.style.display = 'flex';
}

function closeDeleteModal() {
    deleteConfirmModal.classList.remove('show');
    deleteConfirmModal.style.display = 'none';
    pendingDeleteId = null;
    pendingDeleteCard = null;
}

async function confirmDelete() {
    if (!pendingDeleteId) return;

    const planId = pendingDeleteId;
    const card = pendingDeleteCard;

    confirmDeleteBtn.disabled = true;
    confirmDeleteBtn.textContent = 'Deleting...';

    try {
        const res = await fetch(`${API_BASE_URL}/plans/${planId}`, {
            method: 'DELETE',
            headers: authHeaders()
        });

        if (res.status === 401) { handleUnauthorized(); return; }

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showError(err.detail || 'Failed to delete plan.');
            closeDeleteModal();
            return;
        }

        // Remove from local array
        plans = plans.filter(p => p.id !== planId);

        // Animate removal
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => card.remove(), 300);

        closeDeleteModal();
        showToast('Travel plan deleted successfully.');
        totalPlansEl.textContent = plans.length;

        if (plans.length === 0) {
            noPlansMessage.style.display = 'block';
        }
    } catch (e) {
        showError('Network error. Could not delete the plan.');
        closeDeleteModal();
    } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.textContent = 'Delete';
    }
}

// ─── Logout ───────────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// ─── Modal Events ─────────────────────────────────────────────────────────────
cancelDeleteBtn.addEventListener('click', closeDeleteModal);
deleteBackdrop.addEventListener('click', closeDeleteModal);
confirmDeleteBtn.addEventListener('click', confirmDelete);

// ─── Init ─────────────────────────────────────────────────────────────────────
(function init() {
    const email = getUserEmail();
    userEmailEl.textContent = email;
    profileEmailEl.textContent = email;
    fetchPlans();
})();
