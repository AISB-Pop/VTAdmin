// Check authentication when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) {
        return;
    }

    // Initialize the dashboard
    initializeDashboard();
    
    // Add event listeners for buttons
    document.getElementById('add-user-btn').addEventListener('click', function() {
        showUserModal('add');
    });
});

// Initialize dashboard components
function initializeDashboard() {
    // Set user info
    document.getElementById('user-email').textContent = sessionStorage.getItem('userEmail');
    
    // Initialize DataTables
    $('#users-table').DataTable();
    
    // Load initial data
    loadDashboardData();
    loadUserData();
    initializeCharts();
    
    // Add event listeners
    setupEventListeners();
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        const response = await fetch('http://localhost:3002/api/analytics', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).catch(error => {
            console.error('Analytics connection error:', error);
            throw new Error('Cannot connect to analytics endpoint. Please ensure the server is running.');
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Analytics request failed with status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load analytics data');
        }

        // Update dashboard statistics
        updateDashboardStats(data);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values when analytics fail to load
        updateDashboardStats({
            totalUsers: '?',
            activeSessions: '?',
            todaySales: 0,
            pendingOrders: '?'
        });
    }
}

// Load user data from API
async function loadUserData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '<tr><td colspan="6" class="loading">Loading users...</td></tr>';

        const response = await fetch('http://localhost:3002/api/users', {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).catch(error => {
            console.error('Server connection error:', error);
            throw new Error('Cannot connect to server. Please ensure the server is running on port 3002.');
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to fetch users (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to load users');
        }

        const users = data.users;
        if (!Array.isArray(users)) {
            throw new Error('Invalid data format received from server');
        }

        // Clear existing table
        tableBody.innerHTML = '';

        // Populate table with user data
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username || 'N/A'}</td>
                <td>${user.email}</td>
                <td>${user.role || user.user_type || 'N/A'}</td>
                <td><span class="status-badge ${user.status || 'active'}">${user.status || 'active'}</span></td>
                <td class="action-buttons">
                    <button onclick="editUser('${user.user_type || 'admin'}', ${user.id})" class="btn btn-edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteUser('${user.user_type || 'admin'}', ${user.id})" class="btn btn-delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Initialize or reinitialize DataTable with enhanced options
        if ($.fn.DataTable.isDataTable('#users-table')) {
            $('#users-table').DataTable().destroy();
        }
        $('#users-table').DataTable({
            order: [[0, 'desc']], // Sort by ID descending
            pageLength: 10,
            responsive: true,
            dom: '<"top"lf>rt<"bottom"ip><"clear">',
            language: {
                search: "Search users:",
                lengthMenu: "Show _MENU_ users per page",
                info: "Showing _START_ to _END_ of _TOTAL_ users",
                paginate: {
                    first: "First",
                    last: "Last",
                    next: "Next",
                    previous: "Previous"
                }
            }
        });

    } catch (error) {
        console.error('Error loading user data:', error);
        const errorMessage = error.message || 'Error loading users. Please try again.';
        
        // Show error message in table
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="error-message">
                        <i class="fas fa-exclamation-circle"></i> ${errorMessage}
                    </td>
                </tr>
            `;
        }
    }
}

// Initialize charts
function initializeCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Sales',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });

    // Users Chart
    const usersCtx = document.getElementById('users-chart').getContext('2d');
    new Chart(usersCtx, {
        type: 'bar',
        data: {
            labels: ['Outsiders', 'Insiders', 'Admins'],
            datasets: [{
                label: 'User Distribution',
                data: [12, 19, 3],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Show section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Load section-specific data
    if (sectionId === 'user-management') {
        loadUserData();
    } else if (sectionId === 'analytics') {
        loadAnalytics();
    }
}

// User Management Functions
async function showUserModal(mode, userId = null) {
    const modal = document.getElementById('user-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('user-form');

    title.textContent = mode === 'add' ? 'Add New User' : 'Edit User';
    
    if (mode === 'edit' && userId) {
        try {
            const response = await fetch(`http://localhost:3002/api/users/${userId}`);
            const user = await response.json();
            
            document.getElementById('user-name').value = user.username;
            document.getElementById('user-email').value = user.email;
            document.getElementById('user-role').value = user.role;
            document.getElementById('user-status').value = user.status;
            document.getElementById('user-id').value = user.id;
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    } else {
        form.reset();
        document.getElementById('user-id').value = '';
    }

    modal.style.display = 'block';
}

// Add saveUser function
async function saveUser(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userId = formData.get('user-id');
    const userData = {
        username: formData.get('user-name'),
        email: formData.get('user-email'),
        role: formData.get('user-role'),
        status: formData.get('user-status')
    };

    // Validate required fields
    if (!userData.username || !userData.email || !userData.role) {
        alert('Please fill in all required fields');
        return;
    }

    if (!userId) {
        // Add new user - password required for new users
        const password = formData.get('user-password');
        if (!password) {
            alert('Password is required for new users');
            return;
        }
        userData.password = password;
    }

    try {
        const url = userId 
            ? `http://localhost:3002/api/users/${userId}`
            : 'http://localhost:3002/api/users';
            
        const response = await fetch(url, {
            method: userId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to save user');
        }

        closeModal();
        await loadUserData(); // Refresh the table
        alert(userId ? 'User updated successfully' : 'User added successfully');
    } catch (error) {
        console.error('Error saving user:', error);
        alert(error.message || 'An error occurred while saving the user');
    }
}

async function deleteUser(userType, userId) {
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3002/api/users/${userType}/${userId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete user');
        }

        const data = await response.json();
        if (data.success) {
            alert('User deleted successfully');
            loadUserData(); // Reload the user list
        } else {
            throw new Error(data.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    }
}

// Content Management Functions
function showContentTab(tab) {
    const contentArea = document.getElementById('content-area');
    
    // Update active tab styling
    document.querySelectorAll('.content-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load content based on tab
    switch(tab) {
        case 'products':
            contentArea.innerHTML = '<h3>Product Management</h3>';
            // Add product management interface
            break;
        case 'articles':
            contentArea.innerHTML = '<h3>Article Management</h3>';
            // Add article management interface
            break;
        case 'media':
            contentArea.innerHTML = '<h3>Media Library</h3>';
            // Add media management interface
            break;
    }
}

// Security Functions
function showSecurityTab(tab) {
    const securityLogs = document.getElementById('security-logs');
    
    // Update active tab styling
    document.querySelectorAll('.security-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load content based on tab
    switch(tab) {
        case 'login-attempts':
            displayLoginAttempts();
            break;
        case 'banned-users':
            displayBannedUsers();
            break;
        case 'activity-logs':
            displayActivityLogs();
            break;
    }
}

// E-commerce Functions
function showEcommerceTab(tab) {
    const ecommerceContent = document.getElementById('ecommerce-content');
    
    // Update active tab styling
    document.querySelectorAll('.ecommerce-tabs button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load content based on tab
    switch(tab) {
        case 'orders':
            displayOrders();
            break;
        case 'inventory':
            displayInventory();
            break;
        case 'transactions':
            displayTransactions();
            break;
        case 'reports':
            displayReports();
            break;
    }
}

// Add closeModal function
function closeModal() {
    const modal = document.getElementById('user-modal');
    modal.style.display = 'none';
}

// Setup Event Listeners
function setupEventListeners() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('user-modal');
        if (event.target === modal) {
            closeModal();
        }
    };

    // Close modal with × button
    document.querySelector('.close').addEventListener('click', closeModal);

    // User form submission
    document.getElementById('user-form').addEventListener('submit', saveUser);

    // Analytics timeframe change
    document.getElementById('analytics-timeframe').addEventListener('change', function() {
        updateAnalytics(this.value);
    });
}

// Helper Functions
function updateAnalytics(timeframe) {
    // Update charts and statistics based on selected timeframe
    console.log('Updating analytics for timeframe:', timeframe);
    // Implement analytics update logic
}

function displayLoginAttempts() {
    const securityLogs = document.getElementById('security-logs');
    securityLogs.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>IP Address</th>
                </tr>
            </thead>
            <tbody>
                ${mockData.loginAttempts.map(attempt => `
                    <tr>
                        <td>${attempt.timestamp}</td>
                        <td>${attempt.email}</td>
                        <td>${attempt.status}</td>
                        <td>${attempt.ip}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Authentication check function
function checkAuth() {
    const userRole = sessionStorage.getItem('userRole');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (!userRole || !userEmail || userRole !== 'superadmin') {
        window.location.href = 'login-signup.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    sessionStorage.clear();
    window.location.href = 'login-signup.html';
}

// Helper function to update dashboard statistics
function updateDashboardStats(data) {
    document.getElementById('total-users').textContent = data.totalUsers || '?';
    document.getElementById('active-sessions').textContent = data.activeSessions || '?';
    document.getElementById('today-sales').textContent = '₱' + (data.todaySales || 0).toLocaleString();
    document.getElementById('pending-orders').textContent = data.pendingOrders || '?';
}

function editUser(userType, userId) {
    showUserModal('edit', userId);
}

// Add event listener for form submission
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', saveUser);
    }
}); 