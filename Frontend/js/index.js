// Modal Elements
const signupModal = document.getElementById('signupModal');
const loginModal = document.getElementById('loginModal');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');
const signupClose = document.getElementById('signupClose');
const loginClose = document.getElementById('loginClose');
const signupBackdrop = document.getElementById('signupBackdrop');
const loginBackdrop = document.getElementById('loginBackdrop');

// Form Elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const signupMessage = document.getElementById('signupMessage');
const loginMessage = document.getElementById('loginMessage');

// Open Sign Up Modal
signupBtn.addEventListener('click', () => {
    signupModal.classList.add('active');
    clearForm('signup');
});

// Open Login Modal
loginBtn.addEventListener('click', () => {
    loginModal.classList.add('active');
    clearForm('login');
});

// Close Sign Up Modal
signupClose.addEventListener('click', () => {
    signupModal.classList.remove('active');
});

// Close Login Modal
loginClose.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

// Close Sign Up Modal when clicking outside
signupBackdrop.addEventListener('click', () => {
    signupModal.classList.remove('active');
});

// Close Login Modal when clicking outside
loginBackdrop.addEventListener('click', () => {
    loginModal.classList.remove('active');
});

// Clear form fields and messages
function clearForm(type) {
    if (type === 'signup') {
        signupForm.reset();
        signupMessage.textContent = '';
        signupMessage.classList.remove('success', 'error');
    } else if (type === 'login') {
        loginForm.reset();
        loginMessage.textContent = '';
        loginMessage.classList.remove('success', 'error');
    }
}

// Show message
function showMessage(messageElement, text, type) {
    messageElement.textContent = text;
    messageElement.classList.remove('success', 'error');
    messageElement.classList.add(type);
}

// Handle Sign Up
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    const submitBtn = signupForm.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Signing Up...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                password,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(signupMessage, data.message || 'Sign up successful!', 'success');
            clearForm('signup');
            setTimeout(() => {
                signupModal.classList.remove('active');
            }, 1500);
        } else {
            showMessage(signupMessage, data.message || 'Sign up failed. Please try again.', 'error');
        }
    } catch (error) {
        showMessage(signupMessage, 'An error occurred. Please try again.', 'error');
        console.error('Sign up error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Sign Up';
    }
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    const submitBtn = loginForm.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Logging In...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });

        const data = await response.json();
        
        console.log('Login Response:', data);
        console.log('Token from response:', data.token || data.access_token);

        if (response.ok) {
            // Try both 'token' and 'access_token' field names
            const token = data.token || data.access_token;
            if (token) {
                storeToken(token);
                console.log('Token stored:', token);
            } else {
                console.warn('No token found in response:', data);
            }
            showMessage(loginMessage, data.message || 'Login successful!', 'success');
            clearForm('login');
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            showMessage(loginMessage, data.message || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        showMessage(loginMessage, 'An error occurred. Please try again.', 'error');
        console.error('Login error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Login';
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        signupModal.classList.remove('active');
        loginModal.classList.remove('active');
    }
});
