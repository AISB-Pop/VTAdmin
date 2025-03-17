// Initialize EmailJS with your public key
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, showing login form');
    
    // Initialize EmailJS
    try {
        emailjs.init("Db-Ko0z3fyQvrvgSt");
        console.log('EmailJS initialized successfully');
    } catch (error) {
        console.error('EmailJS initialization error:', error);
    }
    
    toggleForm('login-form');
});

let resetCodeRequests = 0; // Track how many times the user has requested a reset code
const maxRequests = 3; // Maximum number of requests allowed
let resetTimer; // Timer variable for enabling the button after 60 seconds

// Toggle between forms
function toggleForm(formId) {
    console.log('Toggling to form:', formId);
    
    // Hide all forms first
    document.querySelectorAll('.form-container').forEach(function (form) {
        form.style.display = 'none';
        form.classList.remove('show');
    });

    // Show the selected form
    const selectedForm = document.getElementById(formId);
    if (selectedForm) {
        selectedForm.style.display = 'block';
        selectedForm.classList.add('show');
        console.log('Form displayed:', formId);
    } else {
        console.error('Form not found:', formId);
    }
}

// Function to clear all form fields
function clearFormFields() {
    const inputs = document.querySelectorAll('.form-container input, .form-container select');

    inputs.forEach(function (input) {
        if (input.type === 'checkbox') {
            input.checked = false; // Reset checkbox
        } else {
            input.value = ''; // Clear other fields
        }
    });

    document.getElementById("send-reset-code").innerText = "Send Reset Code";
    document.getElementById("send-reset-code").disabled = false;

    document.getElementById("reset-code-container").style.display = "none";
    document.getElementById("new-password-container").style.display = "none";
    document.getElementById("reset-code-timer").style.display = "none"; // Hide the timer initially
}

// Function to handle radio button selection
function handleAccountTypeSelection() {
    // Enable the "Send Reset Code" button when either "Personal" or "Student" is selected
    document.getElementById('send-reset-code').disabled = false;
}

// Function to send the "Send Reset Code" button email
function sendResetCode() {
    const email = document.getElementById('forgot-email').value;

    if (!email) {
        alert("Please enter your email.");
        return;
    }

    if (resetCodeRequests >= maxRequests) {
        alert("You have reached the maximum number of reset code requests. Try again tomorrow!");
        window.location.href = "homepage.html";
        return;
    }

    // Validate email based on selected account type
    if (document.getElementById("forgot-personal").checked) {
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
            alert("Please enter a valid Gmail address.");
            return;
        }
        sendEmailViaGmail(email);
    } else if (document.getElementById("forgot-student").checked) {
        if (!/^[rR][a-zA-Z0-9._%+-]*@feuroosevelt\.edu\.ph$/.test(email)) {
            alert("Please enter a valid FEU Roosevelt email address.");
            return;
        }
        sendEmailViaOutlook(email);
    }

    const resetCode = generateRandomCode();
    resetCodeRequests++;

    document.getElementById("reset-code-container").style.display = "block";
    document.getElementById("send-reset-code").innerText = "Code Sent";
    document.getElementById("send-reset-code").disabled = true;

    // Show the timer and start the countdown
    document.getElementById("reset-code-timer").style.display = "block";
    startTimer(60); // Start the timer for 60 seconds
}

let timerInterval; // Variable to store the timer interval

// Function to start the countdown timer
function startTimer(duration) {
    let timer = duration;
    const timerDisplay = document.getElementById('timer');
    
    // Update the timer every second
    timerInterval = setInterval(function() {
        timerDisplay.textContent = timer;
        timer--;
        
        // Stop the timer when it reaches 0
        if (timer < 0) {
            clearInterval(timerInterval);
            document.getElementById("send-reset-code").innerText = "Send Reset Code"; // Reset button text
            document.getElementById("send-reset-code").disabled = false; // Re-enable the button
            document.getElementById("reset-code-timer").style.display = "none"; // Hide the timer
        }
    }, 1000);
}

// Function to stop and reset the timer to 60 seconds
function stopAndResetTimer() {
    clearInterval(timerInterval); // Stop the ongoing timer
    const timerDisplay = document.getElementById('timer');
    const resetCodeTimer = document.getElementById('reset-code-timer');
    
    // Reset the timer to 60 seconds
    timerDisplay.textContent = 60;
    
    // Hide the reset code timer container
    if (resetCodeTimer) {
        resetCodeTimer.style.display = "none";
    }
    
    // Re-enable the "Send Reset Code" button
    document.getElementById("send-reset-code").innerText = "Send Reset Code";
    document.getElementById("send-reset-code").disabled = false;
}

// Function to hide the reset code timer container (without stopping or resetting the timer)
function hideResetCodeTimer() {
    const resetCodeTimer = document.getElementById('reset-code-timer');
    if (resetCodeTimer) {
        resetCodeTimer.style.display = "none"; // Hide the entire container
    }
}
   
// Function to generate a random 6-digit reset code
function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send email via Gmail
function sendEmailViaGmail(userEmail) {
    const resetCode = generateRandomCode();
    const templateParams = {
        to_name: userEmail.split('@')[0],
        from_name: "INNOV8",
        reset_code: resetCode,
        to_email: userEmail,
        reply_to: userEmail
    };

    console.log('Attempting to send Gmail reset code to:', userEmail);
    emailjs.send('service_y36kggk', 'template_83hocs5', templateParams)
        .then(function (response) {
            console.log('Gmail reset code sent successfully:', response);
            alert("Reset code sent to your Personal Gmail!");
            window.open("https://accounts.google.com/v3/signin/identifier?ifkv=ASSHykqFTNHjdnsKx1YnzGfpXeDG5f4UBSvxiUXNlonK4tzqQU1oujx1hy0kw3hvDBUO9dDbQ5jh&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-318472835%3A1741079000234835&ddm=1", "_blank");
        }, function (error) {
            console.error('Error details:', error);
            alert("Failed to send reset code. Please check your email configuration.");
        });
}

// Function to send email via Outlook
function sendEmailViaOutlook(userEmail) {
    const resetCode = generateRandomCode();
    const templateParams = {
        to_name: userEmail.split('@')[0],
        from_name: "INNOV8",
        reset_code: resetCode,
        to_email: userEmail,
        reply_to: userEmail
    };

    console.log('Attempting to send Outlook reset code to:', userEmail);
    emailjs.send('service_kerpgbj', 'template_mdsbme2', templateParams)
        .then(function (response) {
            console.log('Outlook reset code sent successfully:', response);
            alert("Reset code sent to your Student Email!");
            window.open("https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=172&ct=1741079346&rver=7.5.2211.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fnlp%3d1%26cobrandid%3dab0455a0-8d03-46b9-b18b-df2f57b9e44c%26RpsCsrfState%3de6c90a4b-24f6-929a-a597-2d4232b87849&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=ab0455a0-8d03-46b9-b18b-df2f57b9e44c", "_blank");
        }, function (error) {
            console.error('Error details:', error);
            alert("Failed to send reset code. Please check your email configuration.");
        });
}

// Event listeners for radio button selection
document.getElementById('forgot-personal').addEventListener('click', handleAccountTypeSelection);
document.getElementById('forgot-student').addEventListener('click', handleAccountTypeSelection);


// Verify reset code
function verifyResetCode() {
    const resetCode = document.getElementById('reset-code').value;

    if (resetCode.length === 6 && /^\d{6}$/.test(resetCode)) {
        // Display popup message
        alert("Authentication Code Correct");
        stopAndResetTimer();
        hideResetCodeTimer();

        // Show the new password fields
        document.getElementById("new-password-container").style.display = "block";
        document.getElementById("reset-code-container").style.display = "none";

        document.getElementById('reset-code').value = '';
    } else {
        alert("Incorrect Authentication Code. Please enter a 6-digit code.");
    }
}

function resetPassword() {
    var email = document.getElementById('forgot-email').value;
    var newPassword = document.getElementById('new-password').value;
    var confirmPassword = document.getElementById('confirm-password').value;

    // Check if the passwords match
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    // Send the email and new password to the backend for updating
    fetch('forgotpass.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'reset_password=true&email=' + encodeURIComponent(email) +
              '&new_password=' + encodeURIComponent(newPassword),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            // Optionally redirect to the login page after success
            alert("Password reset successfully");
            window.location.href = 'login-signup.html';  // Redirect to the login page after success
        } else {
            alert(data.message);
        }
    });
}


// Toggle the visibility of student-specific fields based on some condition
function showStudentFields() {
var studentFields = document.getElementById("student-fields");
studentFields.style.display = "block";  // Show fields
}

// Toggle password visibility
function togglePasswordVisibility(passwordFieldId) {
var passwordField = document.getElementById(passwordFieldId);
if (passwordField.type === "password") {
passwordField.type = "text";  // Show password
} else {
passwordField.type = "password";  // Hide password
}
}

// Function to toggle visibility based on the selected account type
function toggleSignupType(type) {
    console.log('Toggling signup type:', type);
    
    if (type === 'personal') {
        document.getElementById('personal-form').style.display = 'block';
        document.getElementById('student-form').style.display = 'none';
        // Clear student form fields
        if (document.getElementById('signup-email-student')) {
            document.getElementById('signup-email-student').value = '';
        }
    } else if (type === 'student') {
        document.getElementById('student-form').style.display = 'block';
        document.getElementById('personal-form').style.display = 'none';
        // Clear personal form fields
        if (document.getElementById('signup-email-personal')) {
            document.getElementById('signup-email-personal').value = '';
        }
    }
}

function verifyConfirmCodePersonal() {
    var confirmCodeInput = document.getElementById('confirm-code-personal');
    var confirmCode = confirmCodeInput.value;
    var storedCode = window.localStorage.getItem('personal_verification_code');

    if (confirmCode === "") {
        alert("Please enter a confirmation code!");
        return;
    }

    if (confirmCode === storedCode) {
        alert("Code is Valid!");
        // Show the personal fields after valid confirmation code
        document.getElementById('personal-fields').style.display = 'block';
        document.getElementById('confirm-code-container-personal').style.display = 'none';
        // Clear the stored code
        window.localStorage.removeItem('personal_verification_code');
    } else {
        alert("Invalid code! Please try again.");
    }
}

function verifyConfirmCodeStudent() {
    var confirmCodeInput = document.getElementById('confirm-code-student');
    var confirmCode = confirmCodeInput.value;
    var storedCode = window.localStorage.getItem('student_verification_code');

    if (confirmCode === "") {
        alert("Please enter a confirmation code!");
        return;
    }

    if (confirmCode === storedCode) {
        alert("Code is Valid!");
        // Show the student fields after valid confirmation code
        document.getElementById('student-fields').style.display = 'block';
        document.getElementById('confirm-code-container-student').style.display = 'none';
        // Clear the stored code
        window.localStorage.removeItem('student_verification_code');
    } else {
        alert("Invalid code! Please try again.");
    }
} 

// Ensure the "Personal" or "Student" selection is made before proceeding
document.getElementById('personal').addEventListener('click', function () {
    toggleSignupType('personal');
});
document.getElementById('student').addEventListener('click', function () {
    toggleSignupType('student');
});

// Toggle the forgot password type fields (personal/student) and clear the form fields
function clearForgotPasswordFields() {
    const forgotEmail = document.getElementById('forgot-email');
    forgotEmail.value = ''; // Clear the email input
    document.getElementById('reset-code-container').style.display = "none";
    document.getElementById('new-password-container').style.display = "none";
    stopAndResetTimer();
    hideResetCodeTimer();  // Hides the entire reset code timer container
}

// Admin credentials configuration
const adminCredentials = {
    "admin@feuroosevelt.edu.ph": {
        password: "admin123",
        role: "admin",
        dashboard: "admin_dashboard.html"
    },
    "superadmin@feuroosevelt.edu.ph": {
        password: "superadmin123",
        role: "superadmin",
        dashboard: "superadmin_dashboard.html"
    }
};

// Update handleLoginSubmit function to handle admin authentication
async function handleLoginSubmit() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    console.log('Login attempt:', email); // Debug log

    // First check if it's an admin login
    if (adminCredentials.hasOwnProperty(email)) {
        if (password === adminCredentials[email].password) {
            // Store admin session info
            try {
                sessionStorage.setItem('userRole', adminCredentials[email].role);
                sessionStorage.setItem('userEmail', email);
                console.log('Session stored:', {
                    role: sessionStorage.getItem('userRole'),
                    email: sessionStorage.getItem('userEmail')
                }); // Debug log
                
                alert(`Login successful! Welcome ${adminCredentials[email].role}!`);
                window.location.href = adminCredentials[email].dashboard;
            } catch (error) {
                console.error('Session storage error:', error);
                alert('Error storing session. Please try again.');
            }
            return;
        } else {
            alert('Invalid admin credentials!');
            return;
        }
    }

    try {
        // Send login request to server
        const response = await fetch('http://localhost:3002/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.success) {
            // Store user session info
            sessionStorage.setItem('userRole', data.user.role);
            sessionStorage.setItem('userEmail', data.user.email);
            
            // Redirect based on user role
            let redirectUrl;
            switch(data.user.role) {
                case 'outsider':
                    redirectUrl = 'homepage_PO.html';
                    break;
                case 'insider':
                    redirectUrl = 'homepage_PI.html';
                    break;
                default:
                    redirectUrl = 'homepage.html';
            }
            
            alert('Login successful!');
            window.location.href = redirectUrl;
        } else {
            alert(data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please check your credentials and try again.');
    }
}

// Add authentication check function
function checkAuth() {
    const userRole = sessionStorage.getItem('userRole');
    const userEmail = sessionStorage.getItem('userEmail');
    
    console.log('Checking auth:', { userRole, userEmail }); // Debug log
    
    if (!userRole || !userEmail) {
        console.log('Auth failed: missing credentials'); // Debug log
        window.location.href = 'login-signup.html';
        return false;
    }
    console.log('Auth successful'); // Debug log
    return true;
}

// Add logout function
function logout() {
    sessionStorage.clear();
    window.location.href = 'login-signup.html';
}

// Add calculateAge function
function calculateAge() {
    const birthdayInput = document.getElementById('signup-birthday');
    const ageInput = document.getElementById('signup-age');
    
    if (birthdayInput.value) {
        const birthday = new Date(birthdayInput.value);
        const today = new Date();
        let age = today.getFullYear() - birthday.getFullYear();
        const monthDiff = today.getMonth() - birthday.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
            age--;
        }
        
        ageInput.value = age;
    }
}

// Function to send email confirmation for personal accounts
async function sendEmailConfirmationPersonal(userEmail) {
    const confirmationCode = generateRandomCode();
    console.log('Preparing to send personal email to:', userEmail);

    // Validate email format
    if (!userEmail || !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(userEmail)) {
        alert('Invalid email format. Please enter a valid Gmail address.');
        return;
    }

    const templateParams = {
        to_name: userEmail.split('@')[0],
        from_name: "INNOV8",
        reset_code: confirmationCode,
        reply_to: userEmail,
        to_email: userEmail.trim()
    };

    try {
        console.log('Sending email with params:', templateParams);
        const response = await emailjs.send(
            'service_y36kggk',  // Gmail service
            'template_83hocs5',
            templateParams
        );
        console.log('Email sent successfully. Response:', response);
        
        window.localStorage.setItem('personal_verification_code', confirmationCode);
        document.getElementById('confirm-code-container-personal').style.display = 'block';
        document.getElementById('confirm-email-btn-personal').disabled = true;
        
        alert('Confirmation code sent! Please check your email.');
        
    } catch (error) {
        console.error('Full error object:', error);
        console.error('Error sending email. Status:', error.status);
        console.error('Error text:', error.text);
        
        let errorMessage = 'Failed to send confirmation email. ';
        if (error.status === 400) {
            errorMessage += 'Invalid service ID or configuration. Please check your EmailJS settings. ';
        } else if (error.status === 401 || error.status === 403) {
            errorMessage += 'Authentication failed. Please check your public key. ';
        } else if (error.status === 422) {
            errorMessage += 'Invalid recipient email address. Please check the email format. ';
        } else if (error.status === 429) {
            errorMessage += 'Too many requests. Please try again later. ';
        }
        
        alert(errorMessage);
    }
}

// Function to send email confirmation for student accounts
async function sendEmailConfirmationStudent(userEmail) {
    const confirmationCode = generateRandomCode();
    console.log('Preparing to send student email to:', userEmail);

    // Validate email format
    if (!userEmail || !/^[rR][a-zA-Z0-9._%+-]*@feuroosevelt\.edu\.ph$/.test(userEmail)) {
        alert('Invalid email format. Please enter a valid FEU Roosevelt email address.');
        return;
    }

    const templateParams = {
        to_name: userEmail.split('@')[0],
        from_name: "INNOV8",
        reset_code: confirmationCode,
        reply_to: userEmail,
        to_email: userEmail.trim()
    };

    try {
        console.log('Sending email with params:', templateParams);
        const response = await emailjs.send(
            'service_kerpgbj',  // Outlook service
            'template_mdsbme2',
            templateParams
        );
        console.log('Email sent successfully. Response:', response);
        
        window.localStorage.setItem('student_verification_code', confirmationCode);
        document.getElementById('confirm-code-container-student').style.display = 'block';
        document.getElementById('confirm-email-btn-student').disabled = true;
        
        alert('Confirmation code sent! Please check your email.');
        
    } catch (error) {
        console.error('Full error object:', error);
        console.error('Error sending email. Status:', error.status);
        console.error('Error text:', error.text);
        
        let errorMessage = 'Failed to send confirmation email. ';
        if (error.status === 400) {
            errorMessage += 'Invalid service ID or configuration. Please check your EmailJS settings. ';
        } else if (error.status === 401 || error.status === 403) {
            errorMessage += 'Authentication failed. Please check your public key. ';
        } else if (error.status === 422) {
            errorMessage += 'Invalid recipient email address. Please check the email format. ';
        } else if (error.status === 429) {
            errorMessage += 'Too many requests. Please try again later. ';
        }
        
        alert(errorMessage);
    }
}

// Function to check email format and enable confirmation button
function checkEmail(accountType) {
    const emailInput = document.getElementById(`signup-email-${accountType}`);
    const confirmBtn = document.getElementById(`confirm-email-btn-${accountType}`);
    const email = emailInput.value.trim();

    if (accountType === 'personal') {
        // Check for Gmail format
        if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
            confirmBtn.disabled = false;
            return true;
        }
        alert('Please enter a valid Gmail address');
        confirmBtn.disabled = true;
        return false;
    } else if (accountType === 'student') {
        // Check for FEU Roosevelt email format
        if (/^[rR][a-zA-Z0-9._%+-]*@feuroosevelt\.edu\.ph$/.test(email)) {
            confirmBtn.disabled = false;
            return true;
        }
        alert('Please enter a valid FEU Roosevelt email address');
        confirmBtn.disabled = true;
        return false;
    }
}

// Function to send email confirmation based on account type
function sendEmailConfirmation(accountType) {
    const emailInput = document.getElementById(`signup-email-${accountType}`);
    const email = emailInput.value.trim();

    if (accountType === 'personal') {
        if (checkEmail('personal')) {
            sendEmailConfirmationPersonal(email);
        }
    } else if (accountType === 'student') {
        if (checkEmail('student')) {
            sendEmailConfirmationStudent(email);
        }
    }
}

// Show the personal (Outsider) form and clear the student form
function showPersonalForm() {
    document.getElementById('personal-form').style.display = 'block';
    document.getElementById('student-form').style.display = 'none';
    clearFormFields('student-form');  // Clear all inputs in the student form when switching to personal
    document.getElementById('personal-fields').style.display = 'none';
    document.getElementById('confirm-code-container-personal').style.display = 'none';

    // Hide student-specific fields and confirmation sections
    document.getElementById('student-fields').style.display = 'none';
    document.getElementById('confirm-code-container-student').style.display = 'none';
    document.getElementById('confirm-email-btn-student').disabled = true;
}

// Show the student (Insider) form and clear the personal form
function showStudentForm() {
    document.getElementById('student-form').style.display = 'block';
    document.getElementById('personal-form').style.display = 'none';
    clearFormFields('personal-form');  // Clear all inputs in the personal form when switching to student
    document.getElementById('student-fields').style.display = 'none';
    document.getElementById('confirm-code-container-student').style.display = 'none';

    // Hide personal-specific fields and confirmation sections
    document.getElementById('personal-fields').style.display = 'none';
    document.getElementById('confirm-code-container-personal').style.display = 'none';
    document.getElementById('confirm-email-btn-personal').disabled = true;
}

// Function to handle signup form submission
async function handleSignupSubmit(accountType, event) {
    if (!event) {
        console.error('No event provided to handleSignupSubmit');
        return;
    }

    event.preventDefault(); // Prevent default form submission

    // Get the form data based on account type
    const email = document.getElementById(`signup-email-${accountType}`).value;
    const password = document.getElementById(`signup-password-${accountType}`).value;
    const contact = document.getElementById(`signup-contact-${accountType}`).value;
    
    // Additional fields for student accounts
    let additionalData = {};
    if (accountType === 'student') {
        additionalData = {
            birthday: document.getElementById('signup-birthday').value,
            age: document.getElementById('signup-age').value,
            gender: document.getElementById('gender').value
        };
    }

    // Validate required fields
    if (!email || !password || !contact) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate contact number format
    if (!/^\d{11}$/.test(contact)) {
        alert('Please enter a valid 11-digit contact number.');
        return;
    }

    // Check if terms are accepted
    const agreeCheckbox = document.getElementById(`agree-checkbox-${accountType}`);
    if (!agreeCheckbox.checked) {
        alert('Please accept the terms and conditions.');
        return;
    }

    try {
        // Prepare the data to send to the server
        const signupData = {
            email,
            password,
            accountType,
            contact_number: contact,
            ...additionalData
        };

        // Send signup request to server
        const response = await fetch('http://localhost:3002/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        if (data.success) {
            // Show success message and redirect to login
            alert('Signup successful! Please login to continue.');
            window.location.href = 'login-signup.html#login';
            toggleForm('login-form');
        } else {
            throw new Error(data.message || 'Signup failed');
        }

    } catch (error) {
        console.error('Signup error:', error);
        alert(error.message || 'An error occurred during signup. Please try again.');
    }
}