import { getPublicKey, encryptWithPublicKey } from './crypto.js';

// Expose togglePasswordVisibility to the window object
window.togglePasswordVisibility = function(passwordFieldId) {
    const passwordField = document.getElementById(passwordFieldId);
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
    } else {
        passwordField.type = 'password';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    toggleForm('login-form');
    // Attach event listener for login form submission
    document.getElementById('login-form-element').addEventListener('submit', async function(event) {
        event.preventDefault();
        await handleLoginSubmit();
    });
});

function toggleForm(formId) {
    console.log('Toggling form');
    document.querySelectorAll('.form-container').forEach(function (form) {
        form.style.display = 'none';
        form.classList.remove('show');
    });

    const selectedForm = document.getElementById(formId);
    if (selectedForm) {
        selectedForm.style.display = 'block';
        selectedForm.classList.add('show');
    } else {
        console.error('Form not found');
    }
}

function showPersonalForm() {
    document.getElementById('personal-form').style.display = 'block';
    document.getElementById('student-form').style.display = 'none';
}

function showStudentForm() {
    document.getElementById('personal-form').style.display = 'none';
    document.getElementById('student-form').style.display = 'block';
}

function calculateAge() {
    const birthday = document.getElementById('signup-birthday').value;
    if (birthday) {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        document.getElementById('signup-age').value = age;
    }
}

async function handleLoginSubmit() {
    try {
        const email = DOMPurify.sanitize(document.getElementById('login-email').value);
        const password = document.getElementById('login-password').value;
        
        // Debug: Log raw input
        console.log('Raw input:', { 
            email, 
            password: password ? '***' : 'empty'
        });
        
        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Get and verify public key
        console.log('Getting public key...');
        const publicKey = await getPublicKey();
        if (!publicKey) throw new Error('No public key available');
        console.log('Public key loaded successfully');

        // Encrypt with additional metadata
        const payload = {
            email: email.trim(),
            password,
            timestamp: Date.now()
        };

        console.log('Payload before encryption:', payload);
        const encryptedData = await encryptWithPublicKey(payload);
        console.log('Encrypted data length:', encryptedData.length);

        const response = await fetch('http://localhost:3002/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ encryptedData })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('Server rejection:', {
                status: response.status,
                statusText: response.statusText,
                data: error
            });
            throw new Error(error.details || error.message || 'Login failed');
        }

        const data = await response.json();
        console.log('Login successful!', data);

        // Store user data
        if (data.user) {
            sessionStorage.setItem('userRole', data.user.role);
            sessionStorage.setItem('userEmail', data.user.email);
            
            const userDetails = {
                email: data.user.email,
                contact_number: data.user.contact_number || '',
                birthday: data.user.birthday ? new Date(data.user.birthday).toISOString().split('T')[0] : '',
                role: data.user.role,
                age: data.user.age || '',
                gender: data.user.gender || ''
            };
            
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            
            // Redirect based on user role
            let redirectUrl;
            switch(data.user.role) {
                case 'outsider':
                    redirectUrl = 'homepage_authorized-user.html';
                    break;
                case 'insider':
                    redirectUrl = 'homepage_authorized-user.html';
                    break;
                case 'admin':
                case 'superadmin':
                    redirectUrl = 'superadmin_dashboard.html';
                    break;
                default:
                    redirectUrl = 'homepage.html';
            }
            
            alert('Login successful!');
            window.location.href = redirectUrl;
        } else {
            throw new Error('No user data received from server');
        }
    } catch (error) {
        console.error('Complete login error:', {
            error,
            errorMessage: error.message,
            stack: error.stack
        });
        alert(`Login failed: ${error.message}`);
    }
}

async function handleSignupSubmit(accountType, event) {
    event.preventDefault();
    try {
        const formData = {
            email: DOMPurify.sanitize(document.getElementById(`signup-email-${accountType}`).value),
            password: document.getElementById(`signup-password-${accountType}`).value,
            contact_number: DOMPurify.sanitize(document.getElementById(`signup-contact-${accountType}`).value),
            accountType
        };

        if (accountType === 'student') {
            formData.birthday = document.getElementById('signup-birthday').value;
            formData.age = document.getElementById('signup-age').value;
            formData.gender = document.getElementById('gender').value;
        }

        // Get public key from server
        const publicKey = await getPublicKey();
        
        // Encrypt sensitive data
        const encryptedData = await encryptWithPublicKey(formData);

        const response = await fetch('http://localhost:3002/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ encryptedData })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('Signup successful! Please check your email for verification.');
            window.location.href = 'login-signup.html';
        } else {
            alert(data.error || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('An error occurred during signup');
    }
}

// Add other necessary functions here... 
