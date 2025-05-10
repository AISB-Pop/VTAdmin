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

// Add WebSocket connection
let ws;
let charts = {};
let realtimeData = {
    activeUsers: [],
    salesData: [],
    sessionDurations: []
};

// Initialize WebSocket connection
function initializeWebSocket() {
    try {
        ws = new WebSocket('ws://localhost:3002/ws');
        
        ws.onopen = () => {
            console.log('WebSocket connected');
            // Add real-time indicator
            const indicator = document.createElement('span');
            indicator.className = 'realtime-indicator';
            document.querySelector('.dashboard-nav').appendChild(indicator);
        };
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleRealtimeUpdate(data);
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            // Remove real-time indicator if connection fails
            document.querySelector('.realtime-indicator')?.remove();
        };
        
        ws.onclose = () => {
            console.log('WebSocket disconnected. Reconnecting...');
            // Remove real-time indicator
            document.querySelector('.realtime-indicator')?.remove();
            // Try to reconnect after 5 seconds
            setTimeout(initializeWebSocket, 5000);
        };
    } catch (error) {
        console.error('Error initializing WebSocket:', error);
    }
}

// Handle real-time updates
function handleRealtimeUpdate(data) {
    switch(data.type) {
        case 'users':
            updateUserStats(data);
            break;
        case 'sales':
            updateSalesStats(data);
            break;
        case 'sessions':
            updateSessionStats(data);
            break;
    }
    updateCharts();
}

// Update dashboard data
async function updateDashboardData() {
    try {
        await loadDashboardData();
        await loadUserData();
    } catch (error) {
        console.error('Error updating dashboard data:', error);
    }
}

// Initialize dashboard components
function initializeDashboard() {
    // Set user info
    document.getElementById('user-email').textContent = sessionStorage.getItem('userEmail');
    
    // Initialize DataTables
    $('#users-table').DataTable();
    
    // Initialize WebSocket connection
    initializeWebSocket();
    
    // Load initial data
    loadDashboardData();
    loadUserData();
    initializeCharts();
    
    // Add event listeners
    setupEventListeners();
    
    // Start periodic updates
    setInterval(updateDashboardData, 30000); // Update every 30 seconds
}

// Initialize charts with real-time data
function initializeCharts() {
    // Real-time activity chart
    const realtimeCtx = document.getElementById('realtime-activity-chart').getContext('2d');
    charts.realtimeActivity = new Chart(realtimeCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Active Users',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Real-time User Activity'
                }
            }
        }
    });

    // Session duration chart
    const sessionCtx = document.getElementById('session-duration-chart').getContext('2d');
    charts.sessionDuration = new Chart(sessionCtx, {
        type: 'bar',
        data: {
            labels: ['0-5m', '5-15m', '15-30m', '30-60m', '60m+'],
            datasets: [{
                label: 'Session Duration Distribution',
                data: [0, 0, 0, 0, 0],
                backgroundColor: 'rgba(54, 162, 235, 0.5)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Sessions'
                    }
                }
            }
        }
    });

    // Sales chart with real data
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    charts.sales = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Monthly Sales',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales (₱)'
                    }
                }
            }
        }
    });
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        const response = await fetch('http://localhost:3002/api/analytics/dashboard', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('token')}` // Add auth token if you have it
            }
        });

        if (!response.ok) {
            throw new Error(`Analytics request failed with status: ${response.status}`);
        }

        const data = await response.json();
        
        // Update dashboard statistics with actual data
        updateDashboardStats({
            totalUsers: data.totalUsers || 0,
            activeSessions: data.activeSessions || 0,
            todaySales: data.todaySales || 0,
            pendingOrders: data.pendingOrders || 0,
            avgSessionDuration: data.avgSessionDuration || 0,
            avgProcessingTime: data.avgProcessingTime || 0,
            usersTrend: data.usersTrend || 0,
            salesToday: data.salesToday || 0
        });

        // Update real-time activity chart
        if (charts.realtimeActivity) {
            const activityData = data.realtimeActivity || [];
            charts.realtimeActivity.data.labels = activityData.map(point => new Date(point.timestamp));
            charts.realtimeActivity.data.datasets[0].data = activityData.map(point => point.count);
            charts.realtimeActivity.update();
        }

        // Update session duration chart
        if (charts.sessionDuration) {
            const sessionData = data.sessionDistribution || [0, 0, 0, 0, 0];
            charts.sessionDuration.data.datasets[0].data = sessionData;
            charts.sessionDuration.update();
        }

        // Update sales chart
        if (charts.sales) {
            const salesData = data.monthlySales || [];
            charts.sales.data.labels = salesData.map(point => point.month);
            charts.sales.data.datasets[0].data = salesData.map(point => point.amount);
            charts.sales.update();
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error state in UI
        document.getElementById('total-users').textContent = '!';
        document.getElementById('active-sessions').textContent = '!';
        document.getElementById('today-sales').textContent = '₱0';
        document.getElementById('pending-orders').textContent = '!';
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> Error loading dashboard data: ${error.message}`;
        document.querySelector('.main-content').prepend(errorDiv);
        
        // Remove error message after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Update dashboard statistics
function updateDashboardStats(data) {
    // Update basic stats with actual numbers
    document.getElementById('total-users').textContent = data.totalUsers;
    document.getElementById('active-sessions').textContent = data.activeSessions;
    document.getElementById('today-sales').textContent = '₱' + (data.todaySales || 0).toLocaleString();
    document.getElementById('pending-orders').textContent = data.pendingOrders;
    
    // Update trends and averages
    const usersTrendElement = document.getElementById('users-trend');
    if (usersTrendElement) {
        usersTrendElement.textContent = formatTrend(data.usersTrend);
        usersTrendElement.dataset.trend = data.usersTrend >= 0 ? 'up' : 'down';
    }

    const salesTodayElement = document.getElementById('sales-trend');
    if (salesTodayElement) {
        salesTodayElement.textContent = formatTrend(data.salesToday);
        salesTodayElement.dataset.trend = data.salesToday >= 0 ? 'up' : 'down';
    }

    // Update duration displays
    document.getElementById('avg-session-duration').textContent = formatDuration(data.avgSessionDuration);
    document.getElementById('avg-processing-time').textContent = formatDuration(data.avgProcessingTime);
}

// Format trend data
function formatTrend(trend) {
    if (!trend) return '';
    const isPositive = trend > 0;
    return `${isPositive ? '↑' : '↓'} ${Math.abs(trend)}% vs yesterday`;
}

// Format duration in minutes/hours
function formatDuration(minutes) {
    if (!minutes) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// Update charts with real data
function updateChartsWithData(data) {
    // Update real-time activity chart
    if (data.realtimeActivity) {
        const labels = data.realtimeActivity.map(point => new Date(point.timestamp));
        const values = data.realtimeActivity.map(point => point.activeUsers);
        
        charts.realtimeActivity.data.labels = labels;
        charts.realtimeActivity.data.datasets[0].data = values;
        charts.realtimeActivity.update();
    }
    
    // Update session duration chart
    if (data.sessionDistribution) {
        charts.sessionDuration.data.datasets[0].data = data.sessionDistribution;
        charts.sessionDuration.update();
    }
    
    // Update sales chart
    if (data.monthlySales) {
        const labels = data.monthlySales.map(point => point.month);
        const values = data.monthlySales.map(point => point.amount);
        
        charts.sales.data.labels = labels;
        charts.sales.data.datasets[0].data = values;
        charts.sales.update();
    }
}

// Load user data from API
async function loadUserData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('users-table-body');
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';

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
                <td><span class="badge bg-${getRoleBadgeClass(user.role)}">${user.role}</span></td>
                <td><span class="badge bg-${getStatusBadgeClass(user.status)}">${user.status}</span></td>
                <td>
                    ${user.role === 'insider' ? `
                        <small>
                            Age: ${user.age || 'N/A'}<br>
                            Gender: ${user.gender || 'N/A'}<br>
                            Birthday: ${user.birthday ? new Date(user.birthday).toLocaleDateString() : 'N/A'}
                        </small>
                    ` : '-'}
                </td>
                <td class="action-buttons">
                    <div class="btn-group" role="group">
                        <button onclick="editUser(${user.id}, '${user.role}')" class="btn btn-sm btn-primary">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        ${user.status === 'banned' ? `
                            <button onclick="unbanUser('${user.email}')" class="btn btn-sm btn-warning">
                                <i class="fas fa-user-check"></i> Unban
                            </button>
                        ` : `
                            <button onclick="showBanUserModal('${user.email}')" class="btn btn-sm btn-danger">
                                <i class="fas fa-user-slash"></i> Ban
                            </button>
                        `}
                        <button onclick="deleteUser('${user.role}', ${user.id})" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
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
                    <td colspan="7" class="error-message">
                        <i class="fas fa-exclamation-circle"></i> ${errorMessage}
                    </td>
                </tr>
            `;
        }
    }
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
        loadDashboardData();
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

// Security Functions
async function displayLoginAttempts() {
    const securityLogs = document.getElementById('security-logs');
    try {
        const response = await fetch('http://localhost:3002/api/security/login-attempts');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch login attempts');
        }

        securityLogs.innerHTML = `
            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>IP Address</th>
                            <th>User Agent</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.attempts.map(attempt => `
                            <tr class="${getStatusClass(attempt.status)}">
                                <td>${new Date(attempt.timestamp).toLocaleString()}</td>
                                <td>${attempt.email}</td>
                                <td><span class="badge ${getStatusBadgeClass(attempt.status)}">${attempt.status}</span></td>
                                <td>${attempt.ip_address}</td>
                                <td>${attempt.user_agent}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error fetching login attempts:', error);
        securityLogs.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Error loading login attempts: ${error.message}
            </div>
        `;
    }
}

async function displayBannedUsers() {
    const securityLogs = document.getElementById('security-logs');
    try {
        const response = await fetch('http://localhost:3002/api/security/banned-users');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch banned users');
        }

        securityLogs.innerHTML = `
            <div class="table-responsive">
                <div class="mb-3 d-flex gap-2 align-items-center">
                    <input type="email" id="new-ban-email" class="form-control" style="max-width: 300px;" placeholder="Enter user email" required>
                    <button id="ban-new-user-btn" class="btn btn-danger">
                        <i class="fas fa-user-slash"></i> Ban New User
                    </button>
                </div>
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Reason</th>
                            <th>Banned At</th>
                            <th>Banned Until</th>
                            <th>Banned By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.bannedUsers.map(user => `
                            <tr>
                                <td>${user.email}</td>
                                <td>${user.reason}</td>
                                <td>${new Date(user.banned_at).toLocaleString()}</td>
                                <td>${user.banned_until ? new Date(user.banned_until).toLocaleString() : 'Permanent'}</td>
                                <td>${user.banned_by}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning" onclick="unbanUser('${user.email}')">
                                        <i class="fas fa-user-check"></i> Unban
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Add event listener for the ban new user button
        document.getElementById('ban-new-user-btn').addEventListener('click', () => {
            const emailInput = document.getElementById('new-ban-email');
            const email = emailInput.value.trim();
            
            if (!email) {
                alert('Please enter an email address');
                return;
            }
            
            if (!isValidEmail(email)) {
                alert('Please enter a valid email address');
                return;
            }
            
            showBanUserModal(email);
        });

    } catch (error) {
        console.error('Error fetching banned users:', error);
        securityLogs.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Error loading banned users: ${error.message}
            </div>
        `;
    }
}

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show ban user modal
function showBanUserModal(email) {
    if (!email) {
        alert('Please provide an email address');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    modal.innerHTML = `
        <div class="modal-content" style="background-color: #fefefe; margin: 15% auto; padding: 20px; border: 1px solid #888; width: 80%; max-width: 500px;">
            <span class="close" style="color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer;" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2>Ban User: ${email}</h2>
            <form id="ban-user-form" onsubmit="submitBanUser(event, '${email}')">
                <div class="form-group mb-3">
                    <label for="ban-reason">Reason for Ban:</label>
                    <textarea id="ban-reason" class="form-control" required placeholder="Enter the reason for banning this user" style="width: 100%; min-height: 100px;"></textarea>
                </div>
                <div class="form-group mb-3">
                    <label for="ban-duration">Ban Duration:</label>
                    <select id="ban-duration" class="form-control" required>
                        <option value="1">1 Day</option>
                        <option value="7">7 Days</option>
                        <option value="30">30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="permanent">Permanent</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-danger">Ban User</button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

// Ban user function
async function banUser(email, reason, duration) {
    try {
        // Convert duration to bannedUntil timestamp
        let bannedUntil = null;
        if (duration !== 'permanent') {
            const days = parseInt(duration);
            bannedUntil = new Date();
            bannedUntil.setDate(bannedUntil.getDate() + days);
            bannedUntil = bannedUntil.toISOString().slice(0, 19).replace('T', ' '); // Format for MySQL
        }

        const response = await fetch('http://localhost:3002/api/security/ban-user', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                reason: reason,
                bannedUntil: bannedUntil, // Changed from 'duration'
                bannedBy: sessionStorage.getItem('userEmail')
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to ban user (Status: ${response.status})`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to ban user');
        }

        alert('User has been banned successfully.');
        return true;
    } catch (error) {
        console.error('Error banning user:', error);
        throw error;
    }
}

// Unban user function
async function unbanUser(email) {
    if (!confirm('Are you sure you want to unban this user?')) {
        return;
    }

    try {
        const response = await fetch('http://localhost:3002/api/security/unban-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                unbannedBy: sessionStorage.getItem('userEmail')
            })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to unban user');
        }

        alert('User unbanned successfully');
        displayBannedUsers(); // Refresh the banned users list
    } catch (error) {
        console.error('Error unbanning user:', error);
        alert(`Error unbanning user: ${error.message}`);
    }
}

// Helper functions for status badges
function getStatusClass(status) {
    switch (status.toUpperCase()) {
        case 'SUCCESS': return 'table-success';
        case 'FAILED': return 'table-danger';
        case 'BANNED': return 'table-dark';
        case 'ERROR': return 'table-danger';
        case 'MISSING_CREDENTIALS': return 'table-warning';
        case 'USER_NOT_FOUND': return 'table-info';
        default: return '';
    }
}

function getStatusBadgeClass(status) {
    if (!status) return 'secondary';
    switch (status.toLowerCase()) {
        case 'active': return 'success';
        case 'banned': return 'danger';
        case 'inactive': return 'warning';
        default: return 'secondary';
    }
}

// Submit ban user form
async function submitBanUser(event, email) {
    event.preventDefault();
    
    const reason = document.getElementById('ban-reason').value;
    const duration = document.getElementById('ban-duration').value;
    
    try {
        const success = await banUser(email, reason, duration);
        if (success) {
            event.target.closest('.modal').remove();
            await displayBannedUsers(); // Refresh the banned users list
        }
    } catch (error) {
        console.error('Error banning user:', error);
        alert('Failed to ban user. Please try again.');
    }
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
async function logout() {
    try {
        const email = sessionStorage.getItem('userEmail');
        if (!email) {
            console.error('No user email found in session');
            window.location.href = 'login-signup.html';
            return;
        }

        // Get user's device info
        const userAgent = navigator.userAgent;
        const parser = new UAParser(userAgent);
        const browserInfo = parser.getBrowser();
        const osInfo = parser.getOS();

        const response = await fetch('http://localhost:3002/api/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                email,
                userAgent,
                browserInfo: `${browserInfo.name} ${browserInfo.version}`,
                osInfo: `${osInfo.name} ${osInfo.version}`,
                timestamp: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to log logout action');
        }

        // Clear session and redirect only after successful logout
        sessionStorage.clear();
        window.location.href = 'login-signup.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Still clear session and redirect even if logging failed
        sessionStorage.clear();
        window.location.href = 'login-signup.html';
    }
}

// Helper function to update dashboard statistics
function updateDashboardStats(data) {
    document.getElementById('total-users').textContent = data.totalUsers || '?';
    document.getElementById('active-sessions').textContent = data.activeSessions || '?';
    document.getElementById('today-sales').textContent = '₱' + (data.todaySales || 0).toLocaleString();
    document.getElementById('pending-orders').textContent = data.pendingOrders || '?';
}

// Helper function for role badge colors
function getRoleBadgeClass(role) {
    if (!role) return 'info';
    switch (role.toLowerCase()) {
        case 'insider': return 'primary';
        case 'outsider': return 'secondary';
        case 'unknown': return 'info';
        default: return 'info';
    }
}

// Function to show user edit modal
async function editUser(userId, userRole) {
    try {
        const response = await fetch(`http://localhost:3002/api/users/${userId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        const user = data.user;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'editUserModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit User</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="editUserForm">
                            <input type="hidden" id="editUserId" value="${userId}">
                            <input type="hidden" id="editUserRole" value="${userRole}">
                            <div class="mb-3">
                                <label class="form-label">Username</label>
                                <input type="text" class="form-control" id="editUsername" value="${user.username || ''}" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" id="editEmail" value="${user.email}" required>
                            </div>
                            ${userRole === 'insider' ? `
                                <div class="mb-3">
                                    <label class="form-label">Birthday</label>
                                    <input type="date" class="form-control" id="editBirthday" value="${user.birthday || ''}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Age</label>
                                    <input type="number" class="form-control" id="editAge" value="${user.age || ''}">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Gender</label>
                                    <select class="form-control" id="editGender">
                                        <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Male</option>
                                        <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Female</option>
                                        <option value="other" ${user.gender === 'other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                            ` : ''}
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveUserEdit()">Save Changes</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const modalInstance = new bootstrap.Modal(modal);
        modalInstance.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    } catch (error) {
        console.error('Error fetching user details:', error);
        alert('Error loading user details. Please try again.');
    }
}

// Function to save user edits
async function saveUserEdit() {
    const userId = document.getElementById('editUserId').value;
    const userRole = document.getElementById('editUserRole').value;
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;

    const userData = {
        username,
        email,
        role: userRole
    };

    if (userRole === 'insider') {
        userData.birthday = document.getElementById('editBirthday').value;
        userData.age = document.getElementById('editAge').value;
        userData.gender = document.getElementById('editGender').value;
    }

    try {
        const response = await fetch(`http://localhost:3002/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to update user');
        }

        bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
        loadUserData(); // Refresh the table
        alert('User updated successfully');
    } catch (error) {
        console.error('Error updating user:', error);
        alert(`Error updating user: ${error.message}`);
    }
}

// Add event listener for form submission
document.addEventListener('DOMContentLoaded', function() {
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.addEventListener('submit', saveUser);
    }
});

// Load analytics data
async function loadAnalytics() {
    try {
        const response = await fetch('http://localhost:3002/api/analytics');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to load analytics');
        }

        updateDashboardStats(data);
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Set default values when analytics fail to load
        updateDashboardStats({
            totalUsers: '?',
            activeSessions: '?',
            todaySales: 0,
            pendingOrders: '?'
        });
    }
}

// Display activity logs
async function displayActivityLogs() {
    const securityLogs = document.getElementById('security-logs');
    try {
        const response = await fetch('http://localhost:3002/api/security/activity-logs');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch activity logs');
        }

        // Create filter controls with improved styling
        const filterControls = `
            <div class="mb-4">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label">Filter by Role</label>
                        <div class="btn-group w-100" role="group" id="roleFilterButtons">
                            <input type="radio" class="btn-check" name="roleFilter" id="roleAll" value="" checked>
                            <label class="btn btn-outline-secondary" for="roleAll">All</label>
                            
                            <input type="radio" class="btn-check" name="roleFilter" id="roleInsider" value="Insider">
                            <label class="btn btn-outline-primary" for="roleInsider">Insider</label>
                            
                            <input type="radio" class="btn-check" name="roleFilter" id="roleOutsider" value="Outsider">
                            <label class="btn btn-outline-success" for="roleOutsider">Outsider</label>
                            
                            <input type="radio" class="btn-check" name="roleFilter" id="roleAdmin" value="Admin">
                            <label class="btn btn-outline-danger" for="roleAdmin">Admin</label>
                        </div>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Filter by Action</label>
                        <div class="btn-group w-100" role="group" id="actionFilterButtons">
                            <input type="radio" class="btn-check" name="actionFilter" id="actionAll" value="" checked>
                            <label class="btn btn-outline-secondary" for="actionAll">All</label>
                            
                            <input type="radio" class="btn-check" name="actionFilter" id="actionLogin" value="LOGIN">
                            <label class="btn btn-outline-success" for="actionLogin">Login</label>
                            
                            <input type="radio" class="btn-check" name="actionFilter" id="actionLogout" value="LOGOUT">
                            <label class="btn btn-outline-info" for="actionLogout">Logout</label>
                            
                            <input type="radio" class="btn-check" name="actionFilter" id="actionBan" value="BAN">
                            <label class="btn btn-outline-danger" for="actionBan">Ban</label>
                            
                            <input type="radio" class="btn-check" name="actionFilter" id="actionUnban" value="UNBAN">
                            <label class="btn btn-outline-warning" for="actionUnban">Unban</label>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Filter by Date</label>
                        <input type="date" id="dateFilter" class="form-control">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">Export Options</label>
                        <div class="dropdown">
                            <button class="btn btn-secondary dropdown-toggle w-100" type="button" id="exportDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-download"></i> Export
                            </button>
                            <ul class="dropdown-menu w-100" aria-labelledby="exportDropdown">
                                <li><a class="dropdown-item" href="#" onclick="exportActivityLogs('csv')">
                                    <i class="fas fa-file-csv"></i> Export as CSV
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="exportActivityLogs('txt')">
                                    <i class="fas fa-file-alt"></i> Export as Text
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="printActivityLogs()">
                                    <i class="fas fa-print"></i> Print Logs
                                </a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        securityLogs.innerHTML = `
            ${filterControls}
            <div class="table-responsive">
                <table id="activity-logs-table" class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Action</th>
                            <th>IP Address</th>
                            <th>User Agent</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.logs.map(log => `
                            <tr class="${getActivityLogClass(log.action)}">
                                <td>${formatTimestamp(log.timestamp)}</td>
                                <td>${log.user_email || 'N/A'}</td>
                                <td>
                                    <span class="badge bg-${getRoleBadgeClass(log.user_role)}">
                                        ${formatRole(log.user_role) || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <span class="badge ${getActivityBadgeClass(log.action)}">
                                        ${formatAction(log.action)}
                                    </span>
                                </td>
                                <td>${log.ip_address || 'N/A'}</td>
                                <td>
                                    <small>${formatUserAgent(log.user_agent) || 'N/A'}</small>
                                </td>
                                <td>${formatLogDetails(log) || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Initialize DataTable with improved features
        const table = $('#activity-logs-table').DataTable({
            order: [[0, 'desc']], // Sort by timestamp descending by default
            pageLength: 25,
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
            responsive: true,
            dom: '<"top"l>rt<"bottom"ip><"clear">',
            language: {
                search: "_INPUT_",
                searchPlaceholder: "Search logs...",
                lengthMenu: "Show _MENU_ entries per page",
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                paginate: {
                    first: '<i class="fas fa-angle-double-left"></i>',
                    last: '<i class="fas fa-angle-double-right"></i>',
                    next: '<i class="fas fa-angle-right"></i>',
                    previous: '<i class="fas fa-angle-left"></i>'
                }
            }
        });

        // Add event listeners for custom filters
        $('#roleFilterButtons').on('change', 'input[type="radio"]', function() {
            const roleValue = $(this).val();
            table.column(2).search(roleValue, true, false).draw(); // Role is in column index 2
        });

        $('#actionFilterButtons').on('change', 'input[type="radio"]', function() {
            const actionValue = $(this).val();
            table.column(3).search(actionValue, true, false).draw(); // Action is in column index 3
        });

        $('#dateFilter').on('change', function() {
            const date = this.value;
            if (date) {
                // Format the date to match the timestamp format in the table
                const formattedDate = new Date(date).toLocaleDateString();
                table.column(0).search(formattedDate).draw();
            } else {
                table.column(0).search('').draw();
            }
        });

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        securityLogs.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle"></i> Error loading activity logs: ${error.message}
            </div>
        `;
    }
}

// Helper function to format timestamp
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

// Helper function to format role
function formatRole(role) {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

// Helper function to format action
function formatAction(action) {
    if (!action) return 'N/A';
    return action.replace(/_/g, ' ').toLowerCase()
        .replace(/\b\w/g, l => l.toUpperCase());
}

// Export activity logs
async function exportActivityLogs(format = 'csv') {
    try {
        const table = $('#activity-logs-table').DataTable();
        const filteredData = table.rows({ search: 'applied' }).data().toArray();
        
        let content = '';
        let filename = `activity_logs_${new Date().toISOString().slice(0,10)}`;
        let mimeType = '';

        switch (format) {
            case 'csv':
                content = convertToCSV(filteredData);
                filename += '.csv';
                mimeType = 'text/csv';
                break;
            case 'txt':
                content = convertToText(filteredData);
                filename += '.txt';
                mimeType = 'text/plain';
                break;
            default:
                throw new Error('Unsupported export format');
        }

        // Create and trigger download
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    } catch (error) {
        console.error('Error exporting logs:', error);
        alert('Failed to export logs. Please try again.');
    }
}

// Print activity logs
function printActivityLogs() {
    const table = $('#activity-logs-table').DataTable();
    const filteredData = table.rows({ search: 'applied' }).data().toArray();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Activity Logs - ${new Date().toLocaleDateString()}</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .badge { padding: 3px 8px; border-radius: 3px; }
                    .header { margin-bottom: 20px; }
                    @media print {
                        .no-print { display: none; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Activity Logs</h1>
                    <p>Generated on: ${new Date().toLocaleString()}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Role</th>
                            <th>Action</th>
                            <th>IP Address</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredData.map(row => `
                            <tr>
                                <td>${row[0]}</td>
                                <td>${row[1]}</td>
                                <td>${row[2]}</td>
                                <td>${row[3]}</td>
                                <td>${row[4]}</td>
                                <td>${row[6]}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Helper function to convert data to CSV
function convertToCSV(data) {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'IP Address', 'User Agent', 'Details'];
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
        const cleanRow = row.map(cell => {
            if (typeof cell !== 'string') return '';
            return `"${cell.replace(/"/g, '""')}"`;
        });
        csvRows.push(cleanRow.join(','));
    }
    
    return csvRows.join('\n');
}

// Helper function to convert data to formatted text
function convertToText(data) {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'IP Address', 'User Agent', 'Details'];
    let text = `Activity Logs - Generated on ${new Date().toLocaleString()}\n\n`;
    
    for (const row of data) {
        text += '='.repeat(80) + '\n';
        headers.forEach((header, i) => {
            text += `${header}: ${row[i]}\n`;
        });
        text += '\n';
    }
    
    return text;
}

// Helper function to format user agent string
function formatUserAgent(userAgent) {
    if (!userAgent) return 'N/A';
    // Extract browser and OS information
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    return `${browser.name} ${browser.version} on ${os.name} ${os.version}`;
}

// Helper function to format log details
function formatLogDetails(log) {
    if (!log.details) return 'N/A';
    
    try {
        const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        let formattedDetails = '';
        
        switch (log.action) {
            case 'USER_BANNED':
                formattedDetails = `Banned until: ${details.bannedUntil || 'Permanent'}<br>Reason: ${details.reason}`;
                break;
            case 'USER_UPDATED':
                formattedDetails = `Changed fields: ${Object.keys(details.changes).join(', ')}`;
                break;
            case 'LOGIN':
                formattedDetails = `Login ${details.success ? 'successful' : 'failed'}<br>Attempt #${details.attemptCount}`;
                break;
            default:
                formattedDetails = JSON.stringify(details, null, 2);
        }
        
        return formattedDetails;
    } catch (e) {
        return log.details;
    }
}

// Helper function for activity log row styling
function getActivityLogClass(action) {
    switch (action.toUpperCase()) {
        case 'LOGIN': return 'table-success';
        case 'LOGOUT': return 'table-info';
        case 'USER_BANNED': return 'table-danger';
        case 'USER_UNBANNED': return 'table-warning';
        case 'USER_CREATED': return 'table-primary';
        case 'USER_UPDATED': return 'table-secondary';
        case 'USER_DELETED': return 'table-dark';
        default: return '';
    }
}

// Helper function for activity badge styling
function getActivityBadgeClass(action) {
    switch (action.toUpperCase()) {
        case 'LOGIN': return 'bg-success';
        case 'LOGOUT': return 'bg-info';
        case 'USER_BANNED': return 'bg-danger';
        case 'USER_UNBANNED': return 'bg-warning';
        default: return 'bg-secondary';
    }
} 
