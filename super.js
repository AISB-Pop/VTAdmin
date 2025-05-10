async function viewFullDetails(id) {
    const response = await fetch(`http://localhost:3000/api/superadmin/admins/${id}`, {
      headers: { 'Authorization': 'Bearer SUPER_ADMIN_TOKEN' } // Replace with secure token
    });
    const admin = await response.json();
    alert(`Full Details:\nUsername: ${admin.username}\nEmail: ${admin.email}\nPassword Hash: ${admin.password_hash}\nRole: ${admin.role}`);
  }
  
  async function fetchAdmins() {
    const response = await fetch('http://localhost:3000/api/superadmin/admins', {
      headers: { 'Authorization': 'Bearer SUPER_ADMIN_TOKEN' } // Replace with secure token
    });
    const admins = await response.json();
    const tbody = document.getElementById('adminTable');
    tbody.innerHTML = '';
    admins.forEach(admin => {
      tbody.innerHTML += `
        <tr>
          <td>${admin.id}</td>
          <td>${admin.username}</td>
          <td>${admin.email}</td>
          <td>${admin.role}</td>
          <td>${admin.created_at}</td>
          <td class="actions">
            <button onclick="viewFullDetails(${admin.id})">View Details</button>
            <button onclick="deleteAdmin(${admin.id})" ${admin.role === 'super_admin' ? 'disabled' : ''}>Delete</button>
          </td>
        </tr>
      `;
    });
  }
  
  async function createAdmin() {
    const username = document.getElementById('newUsername').value.trim();
    const email = document.getElementById('newEmail').value.trim();
    const password = document.getElementById('newPassword').value.trim();
  
    if (!username || !email || !password) {
      alert('Please fill in all fields');
      return;
    }
  
    const response = await fetch('http://localhost:3000/api/superadmin/admins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SUPER_ADMIN_TOKEN' // Replace with secure token
      },
      body: JSON.stringify({ username, email, password })
    });
  
    if (response.ok) {
      alert('Admin created successfully!');
      fetchAdmins();
      document.getElementById('newUsername').value = '';
      document.getElementById('newEmail').value = '';
      document.getElementById('newPassword').value = '';
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  }
  
  async function deleteAdmin(id) {
    if (confirm('Are you sure you want to delete this admin?')) {
      const response = await fetch(`http://localhost:3000/api/superadmin/admins/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer SUPER_ADMIN_TOKEN' } // Replace with secure token
      });
      if (response.ok) {
        alert('Admin deleted successfully!');
        fetchAdmins();
      } else {
        const error = await response.json();
        alert('Error: ' + error.error);
      }
    }
  }
  
  // Load admins on page load
  window.onload = fetchAdmins;