// Check authentication when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return; // User will be redirected to login page
    }

    const userRole = sessionStorage.getItem('userRole');
    const userEmail = sessionStorage.getItem('userEmail');

    // Verify user has admin/superadmin role
    if (userRole !== 'admin' && userRole !== 'superadmin') {
        alert('Unauthorized access!');
        window.location.href = 'login-signup.html';
        return;
    }

    // Update UI with user info
    document.getElementById('user-role').textContent = userRole.toUpperCase();
    document.getElementById('user-email').textContent = userEmail;

    // Show/hide features based on role
    if (userRole === 'superadmin') {
        // Enable superadmin-specific features
        document.querySelectorAll('.superadmin-only').forEach(elem => {
            elem.style.display = 'block';
        });
    }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', function() {
    logout();
}); 