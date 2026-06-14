/**
 * JWT Authentication Utility
 * Handles JWT token storage, retrieval, and header management
 */

// Store JWT token in localStorage
function storeToken(token) {
    if (token) {
        localStorage.setItem('token', token);
    }
}

// Retrieve JWT token from localStorage
function getToken() {
    return localStorage.getItem('token');
}

// Remove JWT token from localStorage
function removeToken() {
    localStorage.removeItem('token');
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getToken();
}

// Get authorization headers with JWT token
// Automatically includes: Authorization: Bearer {token}
function getAuthHeaders(additionalHeaders = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...additionalHeaders
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Fetch wrapper that automatically includes JWT token
// Usage: apiFetch(url, { method: 'POST', body: {...} })
async function apiFetch(url, options = {}) {
    const finalOptions = {
        ...options,
        headers: getAuthHeaders(options.headers || {})
    };
    
    const response = await fetch(url, finalOptions);
    return response;
}

// Redirect to login if unauthorized (401)
function handleUnauthorized() {
    removeToken();
    window.location.href = 'index.html';
}
