// content.js - Add prevention for multiple executions
(function() {
    if (window.hasContentScriptRun) return;
    window.hasContentScriptRun = true;
    
    console.log('Content script initialized');

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'AUTH_STATUS') {
            handleAuthStatus(request.data);
        }
        return true;
    });

    // Function to handle authentication status
    function handleAuthStatus(authData) {
        if (authData && authData.token) {
            // Store token in localStorage
            localStorage.setItem('authToken', authData.token);
            // Store user data
            localStorage.setItem('userData', JSON.stringify(authData.user));
        } else {
            // Clear auth data if no token
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    }

    // Function to check if user is authenticated
    function isAuthenticated() {
        const token = localStorage.getItem('authToken');
        return !!token;
    }

    // Function to get stored user data
    function getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    // Function to handle login form submission
    function handleLoginFormSubmit(event) {
        event.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            console.error('Email and password are required');
            return;
        }

        // Send login request to background script
        chrome.runtime.sendMessage({
            type: 'LOGIN_REQUEST',
            data: { email, password }
        }, response => {
            if (response.success) {
                console.log('Login successful');
                window.location.href = '/homepage.html';
            } else {
                console.error('Login failed:', response.error);
                alert(response.error || 'Login failed');
            }
        });
    }

    // Initialize the content script
    function init() {
        console.log('Initializing content script');
        
        // Check authentication status on page load
        if (!isAuthenticated() && !window.location.pathname.includes('login-signup.html')) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = '/login-signup.html';
        } else if (isAuthenticated()) {
            console.log('User is authenticated');
        }
    }

    // Run initialization when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(); 