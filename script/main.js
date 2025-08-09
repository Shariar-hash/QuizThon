// Global variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer = null;
let timeLeft = 0;
let currentDifficulty = '';
let currentUser = null;
let authToken = null;

// API configuration
const API_BASE = 'https://opentdb.com/api.php';
const SERVER_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000/api' 
    : 'https://quizthon-backend.onrender.com/api'; // Updated with your actual backend URL

// Timer durations based on difficulty
const TIMER_DURATIONS = {
    easy: 30,
    medium: 15,
    hard: 10
};

// Notification system for better UX
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification && notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

// Show specific screen
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// User management functions
function initializeApp() {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
        authToken = savedToken;
        fetchUserProfile();
    } else {
        showScreen('authScreen');
    }
}

async function fetchUserProfile() {
    try {
        const response = await fetch(`${SERVER_BASE}/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            showLoggedInState();
        } else {
            // Token is invalid, clear it
            localStorage.removeItem('authToken');
            authToken = null;
            showScreen('authScreen');
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('authToken');
        authToken = null;
        showScreen('authScreen');
    }
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // Clear form inputs and errors when switching
    clearForms();
    clearErrors();
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        // Add slide animation
        loginForm.style.animation = 'slideIn 0.5s ease-out';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        // Add slide animation
        signupForm.style.animation = 'slideIn 0.5s ease-out';
    }
}

function clearForms() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    
    // Remove validation classes
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('error', 'success');
    });
}

function clearErrors() {
    // Clear all error messages
    document.querySelectorAll('.error-message, .field-error').forEach(error => {
        error.style.display = 'none';
        error.textContent = '';
    });
    
    // Remove shake animation
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('shake');
    });
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    
    field.classList.add('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Add shake effect to form
    field.closest('.auth-form').classList.add('shake');
    setTimeout(() => {
        field.closest('.auth-form').classList.remove('shake');
    }, 500);
}

function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('error');
    field.classList.add('success');
    document.getElementById(fieldId + 'Error').style.display = 'none';
}

function validateEmail(email) {
    // More comprehensive email regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }
    
    // Check for common issues
    const domain = email.split('@')[1];
    const localPart = email.split('@')[0];
    
    // Check if local part is too short
    if (localPart.length < 1) {
        return { isValid: false, error: 'Email username is too short' };
    }
    
    // Check if domain is too short
    if (domain.length < 3) {
        return { isValid: false, error: 'Domain name is too short' };
    }
    
    // Check for consecutive dots
    if (email.includes('..')) {
        return { isValid: false, error: 'Email cannot have consecutive dots' };
    }
    
    // Check for valid domain extensions
    const validTlds = [
        'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'co', 'io', 'me', 'tv',
        'info', 'biz', 'name', 'mobi', 'tel', 'travel', 'museum', 'aero', 'coop',
        'jobs', 'post', 'pro', 'xxx', 'ac', 'ad', 'ae', 'af', 'ag', 'ai', 'al',
        'am', 'ao', 'aq', 'ar', 'as', 'at', 'au', 'aw', 'ax', 'az', 'ba', 'bb',
        'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj', 'bm', 'bn', 'bo', 'br', 'bs',
        'bt', 'bv', 'bw', 'by', 'bz', 'ca', 'cc', 'cd', 'cf', 'cg', 'ch', 'ci',
        'ck', 'cl', 'cm', 'cn', 'co', 'cr', 'cu', 'cv', 'cw', 'cx', 'cy', 'cz',
        'de', 'dj', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'eh', 'er', 'es',
        'et', 'eu', 'fi', 'fj', 'fk', 'fm', 'fo', 'fr', 'ga', 'gb', 'gd', 'ge',
        'gf', 'gg', 'gh', 'gi', 'gl', 'gm', 'gn', 'gp', 'gq', 'gr', 'gs', 'gt',
        'gu', 'gw', 'gy', 'hk', 'hm', 'hn', 'hr', 'ht', 'hu', 'id', 'ie', 'il',
        'im', 'in', 'io', 'iq', 'ir', 'is', 'it', 'je', 'jm', 'jo', 'jp', 'ke',
        'kg', 'kh', 'ki', 'km', 'kn', 'kp', 'kr', 'kw', 'ky', 'kz', 'la', 'lb',
        'lc', 'li', 'lk', 'lr', 'ls', 'lt', 'lu', 'lv', 'ly', 'ma', 'mc', 'md',
        'me', 'mg', 'mh', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq', 'mr', 'ms',
        'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'na', 'nc', 'ne', 'nf', 'ng',
        'ni', 'nl', 'no', 'np', 'nr', 'nu', 'nz', 'om', 'pa', 'pe', 'pf', 'pg',
        'ph', 'pk', 'pl', 'pm', 'pn', 'pr', 'ps', 'pt', 'pw', 'py', 'qa', 're',
        'ro', 'rs', 'ru', 'rw', 'sa', 'sb', 'sc', 'sd', 'se', 'sg', 'sh', 'si',
        'sj', 'sk', 'sl', 'sm', 'sn', 'so', 'sr', 'ss', 'st', 'su', 'sv', 'sx',
        'sy', 'sz', 'tc', 'td', 'tf', 'tg', 'th', 'tj', 'tk', 'tl', 'tm', 'tn',
        'to', 'tr', 'tt', 'tv', 'tw', 'tz', 'ua', 'ug', 'uk', 'us', 'uy', 'uz',
        'va', 'vc', 've', 'vg', 'vi', 'vn', 'vu', 'wf', 'ws', 'ye', 'yt', 'za',
        'zm', 'zw'
    ];
    
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1].toLowerCase();
    
    if (!validTlds.includes(tld)) {
        return { isValid: false, error: 'Invalid domain extension' };
    }
    
    // Check for disposable email providers
    const disposableProviders = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
        'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
        'maildrop.cc', 'mohmal.com', 'fakeinbox.com', '33mail.com',
        'mailcatch.com', 'trashmail.com', 'sharklasers.com', 'grr.la'
    ];
    
    if (disposableProviders.includes(domain.toLowerCase())) {
        return { isValid: false, error: 'Disposable email addresses are not allowed' };
    }
    
    // Check for common typos in popular email providers
    const commonProviders = {
        'gmail.com': ['gmai.com', 'gmial.com', 'gmail.co', 'gmaill.com', 'gmai.co'],
        'yahoo.com': ['yaho.com', 'yahoo.co', 'yahooo.com', 'yhoo.com'],
        'hotmail.com': ['hotmai.com', 'hotmial.com', 'hotmal.com', 'hotmailcom'],
        'outlook.com': ['outlok.com', 'outlook.co', 'outlookcom'],
        'icloud.com': ['iclod.com', 'icloud.co', 'icloudcom']
    };
    
    for (const [correct, typos] of Object.entries(commonProviders)) {
        if (typos.includes(domain.toLowerCase())) {
            return { isValid: false, error: `Did you mean ${correct}?` };
        }
    }
    
    return { isValid: true, error: null };
}

// Wrapper function for backward compatibility
function isValidEmail(email) {
    const result = validateEmail(email);
    return result.isValid;
}

// Advanced email validation with domain checking
async function validateEmailAdvanced(email) {
    // First check basic validation
    const basicValidation = validateEmail(email);
    if (!basicValidation.isValid) {
        return basicValidation;
    }
    
    // Additional checks for common email providers
    const domain = email.split('@')[1].toLowerCase();
    const popularProviders = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
        'aol.com', 'live.com', 'msn.com', 'protonmail.com', 'zoho.com',
        'mail.com', 'gmx.com', 'yandex.com', 'qq.com', '163.com', '126.com'
    ];
    
    // Check if it's a known popular provider
    if (popularProviders.includes(domain)) {
        return { isValid: true, error: null };
    }
    
    // For other domains, perform additional validation
    try {
        // Simple domain existence check using a public DNS API
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
        const data = await response.json();
        
        if (data.Status === 0 && data.Answer && data.Answer.length > 0) {
            return { isValid: true, error: null };
        } else {
            return { isValid: false, error: 'Email domain does not exist or cannot receive emails' };
        }
    } catch (error) {
        // If DNS check fails, allow the email (might be a network issue)
        console.warn('DNS check failed, allowing email:', error);
        return { isValid: true, error: null };
    }
}

function setLoadingState(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function continueWithoutLogin() {
    currentUser = null;
    showScreen('setupScreen');
    updateUserProfileSection();
}

// Google OAuth Functions
function initializeGoogleSignIn() {
    console.log('Initializing Google Sign-In...');
    console.log('Current origin:', window.location.origin);
    console.log('Current URL:', window.location.href);
    console.log('Current protocol:', window.location.protocol);
    console.log('Current host:', window.location.host);
    console.log('Current hostname:', window.location.hostname);
    console.log('Current port:', window.location.port);
    
    if (typeof google !== 'undefined' && google.accounts) {
        try {
            google.accounts.id.initialize({
                client_id: '825961513934-h9oldl0g4si01at2m04fsu0j50m4bi4o.apps.googleusercontent.com',
                callback: handleGoogleSignIn,
                auto_select: false,
                cancel_on_tap_outside: true,
                itp_support: true
            });
            console.log('Google Sign-In initialized successfully');
            showGoogleSignInButton();
        } catch (error) {
            console.error('Google Sign-In initialization error:', error);
            alert('Google OAuth Error: ' + error.message + '\n\nThis usually means:\n1. Incorrect authorized origins in Google Cloud Console\n2. Add these origins:\n   - http://localhost:3001\n   - http://127.0.0.1:3001\n   - http://localhost:3000\n   - http://127.0.0.1:3000');
        }
    } else {
        console.log('Google SDK not available, will use demo mode');
    }
}

function signInWithGoogle() {
    console.log('Google sign-in attempted');
    
    // Try real Google sign-in first
    if (typeof google !== 'undefined' && google.accounts) {
        console.log('Google SDK loaded, using button-based sign-in');
        try {
            // Note: The actual sign-in will happen through the rendered button
            // This function is called when the user clicks the custom button
            // The Google-rendered button will automatically handle the OAuth flow
            console.log('Google sign-in button should handle the authentication');
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            handleGoogleOAuthError(error);
        }
    } else {
        console.log('Google SDK not loaded, using demo mode');
        simulateGoogleSignIn();
    }
}

function showGoogleSignInFallback() {
    // Silently fall back to demo mode for better UX
    const userChoice = confirm('Google sign-in is temporarily unavailable.\n\nWould you like to try demo mode or use email authentication instead?');
    
    if (userChoice) {
        simulateGoogleSignIn();
    } else {
        // Focus on email login
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) {
            emailInput.focus();
        }
    }
}

function handleGoogleOAuthError(error) {
    console.error('OAuth Error:', error);
    
    // For production, show a more user-friendly message
    const fallbackMessage = 'Google sign-in is currently unavailable. Please use email registration or continue without login.';
    
    // Create a small notification instead of alert
    showNotification(fallbackMessage, 'warning');
    
    // Offer demo mode as fallback
    setTimeout(() => {
        const tryDemo = confirm('Would you like to try demo mode instead?');
        if (tryDemo) {
            simulateGoogleSignIn();
        }
    }, 2000);
}

function showGoogleSignInButton() {
    // Create a manual sign-in button if the prompt doesn't work
    if (typeof google !== 'undefined' && google.accounts) {
        try {
            google.accounts.id.renderButton(
                document.getElementById("googleBtn"),
                { 
                    theme: "outline", 
                    size: "large",
                    width: 250,
                    text: "continue_with"
                }
            );
            console.log('Google button rendered successfully');
            console.log('If 403 error occurs, check Google Cloud Console authorized origins:');
            console.log('Required origins:', [
                'http://localhost:3001',
                'http://127.0.0.1:3001', 
                'http://localhost:3000',
                'http://127.0.0.1:3000'
            ]);
        } catch (error) {
            console.error('Error rendering Google button:', error);
            setupButtonFallback();
        }
    } else {
        setupButtonFallback();
    }
    
    function setupButtonFallback() {
        // Fallback: Add click handler for demo mode
        const googleBtn = document.getElementById("googleBtn");
        if (googleBtn) {
            googleBtn.addEventListener('click', function() {
                console.log('Google OAuth failed, offering demo mode');
                const useDemo = confirm('Google OAuth is not configured properly.\n\nWould you like to:\n\n✅ Continue with Demo Mode (recommended)\n❌ Cancel and use email/password login\n\nDemo mode lets you test the quiz features!');
                if (useDemo) {
                    simulateGoogleSignIn();
                }
            });
        }
    }
}

// Temporary demo function for testing
function simulateGoogleSignIn() {
    console.log('Showing demo mode options');
    
    // Show a more user-friendly modal
    const userChoice = confirm('🚀 Welcome to QuizThon Demo Mode!\n\nGoogle OAuth is currently being configured. Would you like to:\n\n✅ Continue with Demo Mode\n   → Test all quiz features\n   → Temporary user profile\n   → Full functionality\n\n❌ Cancel and use Email/Password\n   → Create real account\n   → Permanent quiz history\n\nRecommended: Try Demo Mode first!');
    
    if (userChoice) {
        console.log('User chose demo mode');
        // Create a more realistic demo user
        const demoUser = {
            name: 'Demo User',
            email: 'demo@quizthon.com',
            avatar: 'https://via.placeholder.com/40x40/667eea/ffffff?text=DU',
            authProvider: 'google-demo'
        };
        
        // Show loading state briefly for realism
        setLoadingState('googleBtn', true);
        
        setTimeout(() => {
            // Simulate the Google OAuth response
            const simulatedResponse = {
                credential: 'demo_jwt_token_for_testing_' + Date.now()
            };
            
            // Call the existing handler with simulated data
            handleGoogleSignInDemo(simulatedResponse, demoUser);
        }, 800);
        
    } else {
        console.log('User chose to use email authentication');
        // Focus on email login
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) {
            emailInput.focus();
            showNotification('You can create an account using email and password below', 'info');
        }
    }
}

// Demo version of Google sign-in handler
async function handleGoogleSignInDemo(response, demoUser) {
    try {
        setLoadingState('googleBtn', true);
        
        // Simulate API call to create/login Google user
        setTimeout(async () => {
            try {
                // Create a demo JWT token and user data
                const mockToken = 'demo_jwt_' + Date.now();
                
                // Store token and user data
                authToken = mockToken;
                localStorage.setItem('authToken', authToken);
                currentUser = {
                    ...demoUser,
                    authProvider: 'google',
                    quizHistory: [],
                    createdAt: new Date().toISOString()
                };
                
                showLoggedInState();
                updateUserProfileSection();
                
                // Show success message with notification
                showNotification(`Welcome ${currentUser.name}! You've been signed in successfully.`, 'success');
            } catch (error) {
                showNotification('Sign-in failed. Please try again.', 'error');
            } finally {
                setLoadingState('googleBtn', false);
            }
        }, 1000); // Simulate network delay
        
    } catch (error) {
        console.error('Demo Google sign-in error:', error);
        showNotification('Sign-in error. Please try again.', 'error');
        setLoadingState('googleBtn', false);
    }
}

async function handleGoogleSignIn(response) {
    console.log('Google sign-in response received:', response);
    
    try {
        setLoadingState('googleBtn', true);
        
        if (!response.credential) {
            throw new Error('No credential received from Google');
        }
        
        console.log('Sending credential to server...');
        const result = await fetch(`${SERVER_BASE}/auth/google`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ credential: response.credential })
        });

        const data = await result.json();
        console.log('Server response:', data);
        
        if (result.ok) {
            // Store token and user data
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            
            showLoggedInState();
            updateUserProfileSection();
            
            // Show success message
            alert(`Welcome ${currentUser.name}! You've been signed in with Google.`);
        } else {
            console.error('Server error:', data);
            alert(data.error || 'Google sign-in failed. Please try again.');
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        alert(`Google sign-in failed: ${error.message}. Please try again or use email/password login.`);
    } finally {
        setLoadingState('googleBtn', false);
    }
}

function updateUserProfileSection() {
    const profileSection = document.getElementById('userProfileSection');
    
    if (currentUser) {
        // User is logged in - show profile dropdown
        profileSection.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-button" onclick="toggleProfileDropdown()">
                    ${currentUser.avatar ? 
                        `<img src="${currentUser.avatar}" alt="${currentUser.name}" class="profile-avatar">` : 
                        '👤'
                    }
                    ${currentUser.name}
                    <span style="margin-left: 0.5rem;">▼</span>
                </button>
                <div class="dropdown-content" id="profileDropdown">
                    <div class="dropdown-item" onclick="showUserProfile()">
                        👤 View Profile
                    </div>
                    <div class="dropdown-item" onclick="showHistoryScreen()">
                        📊 Quiz History
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" onclick="logout()">
                        🚪 Logout
                    </div>
                </div>
            </div>
        `;
    } else {
        // User is not logged in - show login prompt
        profileSection.innerHTML = `
            <button class="login-prompt-btn" onclick="showScreen('authScreen')">
                🔐 Login for History
            </button>
        `;
    }
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.classList.toggle('show');
    
    // Close dropdown when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeDropdown(e) {
            if (!e.target.closest('.profile-dropdown')) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }, 100);
}

function showUserProfile() {
    // Close dropdown
    document.getElementById('profileDropdown').classList.remove('show');
    
    // Redirect to profile page
    window.location.href = 'profile.html';
}

function setLoadingState(buttonId, isLoading) {
    const button = document.getElementById(buttonId);
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

async function signup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    
    // Clear previous errors
    clearErrors();
    
    let hasErrors = false;
    
    // Validate name
    if (!name) {
        showFieldError('signupName', 'Name is required');
        hasErrors = true;
    } else if (name.length < 2) {
        showFieldError('signupName', 'Name must be at least 2 characters');
        hasErrors = true;
    } else {
        showFieldSuccess('signupName');
    }
    
    // Validate email
    if (!email) {
        showFieldError('signupEmail', 'Email is required');
        hasErrors = true;
    } else {
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            showFieldError('signupEmail', emailValidation.error);
            hasErrors = true;
        } else {
            showFieldSuccess('signupEmail');
            
            // Perform advanced validation in background
            validateEmailAdvanced(email).then(advancedValidation => {
                if (!advancedValidation.isValid) {
                    showFieldError('signupEmail', advancedValidation.error);
                    // Don't set hasErrors here as this is async
                }
            });
        }
    }
    
    // Validate password
    if (!password) {
        showFieldError('signupPassword', 'Password is required');
        hasErrors = true;
    } else if (password.length < 6) {
        showFieldError('signupPassword', 'Password must be at least 6 characters long');
        hasErrors = true;
    } else {
        showFieldSuccess('signupPassword');
    }
    
    if (hasErrors) {
        return;
    }
    
    // Final email validation before submission
    const finalEmailValidation = await validateEmailAdvanced(email);
    if (!finalEmailValidation.isValid) {
        showFieldError('signupEmail', finalEmailValidation.error);
        return;
    }
    
    setLoadingState('signupBtn', true);
    
    try {
        const response = await fetch(`${SERVER_BASE}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            
            // Show success message briefly
            showError('signupError', '✅ Account created successfully! Redirecting...');
            document.getElementById('signupError').className = 'success-message';
            
            setTimeout(() => {
                showLoggedInState();
                clearForms();
            }, 1500);
        } else {
            showError('signupError', data.error);
            if (data.error.includes('email')) {
                showFieldError('signupEmail', 'This email is already registered');
            }
        }
    } catch (error) {
        console.error('Signup error:', error);
        showError('signupError', 'Network error. Please check your internet connection and try again.');
    } finally {
        setLoadingState('signupBtn', false);
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    // Clear previous errors
    clearErrors();
    
    let hasErrors = false;
    
    // Validate email
    if (!email) {
        showFieldError('loginEmail', 'Email is required');
        hasErrors = true;
    } else {
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            showFieldError('loginEmail', emailValidation.error);
            hasErrors = true;
        } else {
            showFieldSuccess('loginEmail');
        }
    }
    
    // Validate password
    if (!password) {
        showFieldError('loginPassword', 'Password is required');
        hasErrors = true;
    } else {
        showFieldSuccess('loginPassword');
    }
    
    if (hasErrors) {
        return;
    }
    
    setLoadingState('loginBtn', true);
    
    try {
        const response = await fetch(`${SERVER_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            authToken = data.token;
            localStorage.setItem('authToken', authToken);
            currentUser = data.user;
            
            // Show success message briefly
            showError('loginError', '✅ Login successful! Redirecting...');
            document.getElementById('loginError').className = 'success-message';
            
            setTimeout(() => {
                showLoggedInState();
                clearForms();
            }, 1500);
        } else {
            showError('loginError', data.error);
            
            // Provide specific field feedback
            if (data.error.includes('email')) {
                showFieldError('loginEmail', 'No account found with this email address');
            } else if (data.error.includes('password')) {
                showFieldError('loginPassword', 'Incorrect password');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('loginError', 'Network error. Please check your internet connection and try again.');
    } finally {
        setLoadingState('loginBtn', false);
    }
}

function logout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('authToken');
    showScreen('authScreen');
    clearForms();
}

function showLoggedInState() {
    document.getElementById('userName').textContent = currentUser.name;
    showScreen('setupScreen');
    updateHistoryDisplay();
    updateUserProfileSection();
}

function showHistoryScreen() {
    showScreen('historyScreen');
    updateHistoryDisplay();
    
    // Show/hide logout button based on login status
    const logoutBtn = document.getElementById('logoutBtn');
    if (currentUser) {
        logoutBtn.style.display = 'inline-block';
        document.getElementById('userInfo').style.display = 'block';
    } else {
        logoutBtn.style.display = 'none';
        document.getElementById('userInfo').style.display = 'none';
    }
}

async function saveQuizResult(percentage, totalQuestions) {
    if (!currentUser || !authToken) return; // Don't save if not logged in
    
    const categorySelect = document.getElementById('category');
    const categoryText = categorySelect.options[categorySelect.selectedIndex].text;
    
    try {
        const response = await fetch(`${SERVER_BASE}/quiz/save-result`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category: categoryText,
                difficulty: currentDifficulty,
                score: score,
                totalQuestions: totalQuestions,
                percentage: percentage
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Update local user data with the new quiz result
            currentUser.quizHistory.unshift(data.quizResult);
            console.log('Quiz result saved successfully!');
        } else {
            console.error('Failed to save quiz result:', data.error);
        }
    } catch (error) {
        console.error('Error saving quiz result:', error);
    }
}

function updateHistoryDisplay() {
    if (!currentUser) {
        // Show login prompt for non-logged users
        document.getElementById('historyList').innerHTML = 
            '<div class="no-history">Please log in to view your quiz history!<br><br><button class="btn" onclick="showScreen(\'authScreen\')">Login Now 🚪</button></div>';
        document.getElementById('totalQuizzes').textContent = '0';
        document.getElementById('avgScore').textContent = '0%';
        document.getElementById('bestScore').textContent = '0%';
        return;
    }
    
    const history = currentUser.quizHistory || [];
    
    // Update stats
    const totalQuizzes = history.length;
    const avgScore = totalQuizzes > 0 ? 
        Math.round(history.reduce((sum, quiz) => sum + quiz.percentage, 0) / totalQuizzes) : 0;
    const bestScore = totalQuizzes > 0 ? 
        Math.max(...history.map(quiz => quiz.percentage)) : 0;
    
    document.getElementById('totalQuizzes').textContent = totalQuizzes;
    document.getElementById('avgScore').textContent = avgScore + '%';
    document.getElementById('bestScore').textContent = bestScore + '%';
    
    // Update history list
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No quiz history yet. Take your first quiz!</div>';
        return;
    }
    
    historyList.innerHTML = history.map(quiz => {
        const date = new Date(quiz.date).toLocaleDateString();
        const time = new Date(quiz.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        return `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-category">${quiz.category}</div>
                    <div class="history-details">
                        ${quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)} • 
                        ${date} at ${time}
                    </div>
                </div>
                <div class="history-score">
                    <div class="score-value">${quiz.score}/${quiz.totalQuestions}</div>
                    <div class="score-percentage">${quiz.percentage}%</div>
                </div>
            </div>
        `;
    }).join('');
}

// Start quiz function
async function startQuiz() {
    const difficulty = document.getElementById('difficulty').value;
    const category = document.getElementById('category').value;

    if (!difficulty || !category) {
        alert('Please select both difficulty and category!');
        return;
    }

    currentDifficulty = difficulty;
    showScreen('quizScreen');
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('questionContainer').style.display = 'none';
    document.getElementById('errorMessage').style.display = 'none';

    try {
        const response = await fetch(`${API_BASE}?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`);
        const data = await response.json();

        if (data.response_code !== 0) {
            throw new Error('Failed to fetch questions');
        }

        currentQuestions = data.results;
        currentQuestionIndex = 0;
        score = 0;
        
        document.getElementById('loadingSpinner').style.display = 'none';
        displayQuestion();
    } catch (error) {
        document.getElementById('loadingSpinner').style.display = 'none';
        document.getElementById('errorMessage').style.display = 'block';
        document.getElementById('errorMessage').textContent = 'Failed to load questions. Please try again.';
    }
}

// Display current question
function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showResults();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('questionText').innerHTML = decodeHTML(question.question);
    
    // Hide previous result message
    document.getElementById('resultMessage').style.display = 'none';
    
    // Prepare answers
    const answers = [...question.incorrect_answers, question.correct_answer];
    shuffleArray(answers);
    
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';
    
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.innerHTML = decodeHTML(answer);
        button.onclick = () => selectAnswer(button, answer);
        answersContainer.appendChild(button);
    });
    
    document.getElementById('questionContainer').style.display = 'block';
    document.getElementById('nextBtn').style.display = 'none';
    selectedAnswer = null;
    
    // Start timer
    startTimer();
}

// Timer functions
function startTimer() {
    // Clear any existing timer first
    if (timer) {
        clearInterval(timer);
    }
    
    timeLeft = TIMER_DURATIONS[currentDifficulty];
    const timerText = document.getElementById('timerText');
    const timerFill = document.getElementById('timerFill');
    
    timerText.textContent = timeLeft;
    timerFill.style.transform = 'rotate(-90deg)';
    
    timer = setInterval(() => {
        timeLeft--;
        timerText.textContent = timeLeft;
        
        // Update timer visual - fill should decrease as time goes down
        const percentage = (timeLeft / TIMER_DURATIONS[currentDifficulty]);
        const degrees = -90 + (percentage * 360);
        timerFill.style.transform = `rotate(${degrees}deg)`;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timer = null;
            timeUp();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function timeUp() {
    // Disable all answer options
    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.add('disabled');
    });
    
    // Show correct answer
    showAnswerResults(null, true);
}

// Select answer
function selectAnswer(button, answer) {
    // Prevent multiple selections
    if (button.classList.contains('disabled')) return;
    
    // Stop the timer immediately
    stopTimer();
    
    // Remove previous selection and add current selection
    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
    selectedAnswer = answer;
    
    // Show answer results immediately
    showAnswerResults(answer, false);
}

// Show correct/incorrect results
function showAnswerResults(userAnswer, timeUp = false) {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correct_answer;
    
    // Disable all answer options and highlight correct/incorrect
    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.add('disabled');
        
        const btnText = btn.innerHTML;
        const correctText = decodeHTML(correctAnswer);
        
        if (btnText === correctText) {
            btn.classList.add('correct');
        } else if (userAnswer && btnText === decodeHTML(userAnswer) && userAnswer !== correctAnswer) {
            btn.classList.add('incorrect');
        }
    });
    
    // Show result message
    const resultMessage = document.getElementById('resultMessage');
    resultMessage.style.display = 'block';
    
    if (timeUp) {
        resultMessage.className = 'result-message time-up-message';
        resultMessage.innerHTML = `⏰ Time's up!<br>The correct answer was: <strong>${decodeHTML(correctAnswer)}</strong>`;
    } else if (userAnswer === correctAnswer) {
        resultMessage.className = 'result-message correct';
        resultMessage.innerHTML = `🎉 Correct!<br>You got it right!`;
        score++;
    } else {
        resultMessage.className = 'result-message incorrect';
        resultMessage.innerHTML = `❌ Incorrect!<br>The correct answer was: <strong>${decodeHTML(correctAnswer)}</strong>`;
    }
    
    // Show next button immediately after showing results
    const nextBtn = document.getElementById('nextBtn');
    const isLastQuestion = (currentQuestionIndex + 1) >= currentQuestions.length;
    
    if (isLastQuestion) {
        nextBtn.innerHTML = 'View Results 🏆';
        nextBtn.onclick = showResults;
    } else {
        nextBtn.innerHTML = 'Next Question ➡️';
        nextBtn.onclick = nextQuestion;
    }
    
    nextBtn.style.display = 'block';
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    
    // Reset answer options
    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect', 'disabled');
    });
    
    // Reset next button to default state
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.innerHTML = 'Next Question ➡️';
    nextBtn.onclick = nextQuestion;
    
    selectedAnswer = null;
    displayQuestion();
}

// Show results
function showResults() {
    const totalQuestions = currentQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    
    // Save quiz result to user history
    saveQuizResult(percentage, totalQuestions);
    
    document.getElementById('finalScore').textContent = `${score}/${totalQuestions}`;
    
    let message = '';
    if (percentage >= 80) {
        message = '🏆 Excellent! You\'re a quiz master!';
    } else if (percentage >= 60) {
        message = '👍 Great job! Well done!';
    } else if (percentage >= 40) {
        message = '😊 Good effort! Keep practicing!';
    } else {
        message = '🤔 Don\'t give up! Try again!';
    }
    
    document.getElementById('scoreMessage').textContent = message;
    showScreen('resultsScreen');
}

// Utility functions
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function restartQuiz() {
    stopTimer();
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    startQuiz();
}

function goHome() {
    stopTimer();
    currentQuestions = [];
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    showScreen('setupScreen');
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Add real-time validation
    addRealTimeValidation();
    
    // Initialize Google Sign-In with retry mechanism
    let retryCount = 0;
    const maxRetries = 10; // Wait up to 5 seconds
    
    function tryInitializeGoogleSignIn() {
        if (typeof google !== 'undefined' && google.accounts) {
            console.log('Google SDK loaded successfully');
            initializeGoogleSignIn();
        } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Google SDK not ready yet, retrying ${retryCount}/${maxRetries} in 500ms...`);
            setTimeout(tryInitializeGoogleSignIn, 500);
        } else {
            console.log('Google SDK failed to load after multiple attempts, using demo mode fallback');
            setupGoogleFallback();
        }
    }
    tryInitializeGoogleSignIn();
    
    function setupGoogleFallback() {
        // Add click handler for demo mode
        const googleBtn = document.getElementById("googleBtn");
        if (googleBtn) {
            googleBtn.addEventListener('click', function() {
                console.log('Google OAuth not available, showing demo options');
                simulateGoogleSignIn();
            });
            console.log('Google button fallback configured for demo mode');
        }
    }
    
    // Update profile section initially
    updateUserProfileSection();
});

function addRealTimeValidation() {
    // Email validation for login
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email) {
                const emailValidation = validateEmail(email);
                if (!emailValidation.isValid) {
                    showFieldError('loginEmail', emailValidation.error);
                } else {
                    showFieldSuccess('loginEmail');
                }
            }
        });
        
        loginEmail.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                const email = this.value.trim();
                if (email) {
                    const emailValidation = validateEmail(email);
                    if (emailValidation.isValid) {
                        showFieldSuccess('loginEmail');
                    }
                }
            }
        });
    }
    
    // Email validation for signup
    const signupEmail = document.getElementById('signupEmail');
    if (signupEmail) {
        signupEmail.addEventListener('blur', async function() {
            const email = this.value.trim();
            if (email) {
                const emailValidation = validateEmail(email);
                if (!emailValidation.isValid) {
                    showFieldError('signupEmail', emailValidation.error);
                } else {
                    showFieldSuccess('signupEmail');
                    
                    // Show checking indicator
                    const errorElement = document.getElementById('signupEmailError');
                    errorElement.textContent = '🔍 Verifying email domain...';
                    errorElement.style.display = 'block';
                    errorElement.style.color = '#667eea';
                    
                    // Perform advanced validation
                    try {
                        const advancedValidation = await validateEmailAdvanced(email);
                        if (!advancedValidation.isValid) {
                            showFieldError('signupEmail', advancedValidation.error);
                        } else {
                            errorElement.style.display = 'none';
                            showFieldSuccess('signupEmail');
                        }
                    } catch (error) {
                        // Hide checking message if validation fails
                        errorElement.style.display = 'none';
                    }
                }
            }
        });
        
        signupEmail.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                const email = this.value.trim();
                if (email) {
                    const emailValidation = validateEmail(email);
                    if (emailValidation.isValid) {
                        showFieldSuccess('signupEmail');
                    }
                }
            }
        });
    }
    
    // Password strength for signup
    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) {
        signupPassword.addEventListener('input', function() {
            const password = this.value.trim();
            if (password.length > 0 && password.length < 6) {
                showFieldError('signupPassword', 'Password must be at least 6 characters');
            } else if (password.length >= 6) {
                showFieldSuccess('signupPassword');
            }
        });
    }
    
    // Name validation for signup
    const signupName = document.getElementById('signupName');
    if (signupName) {
        signupName.addEventListener('blur', function() {
            const name = this.value.trim();
            if (name && name.length < 2) {
                showFieldError('signupName', 'Name must be at least 2 characters');
            } else if (name && name.length >= 2) {
                showFieldSuccess('signupName');
            }
        });
    }
}