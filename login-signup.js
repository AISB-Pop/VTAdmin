document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    try {
        emailjs.init("Db-Ko0z3fyQvrvgSt");
        console.log('EmailJS initialized');
    } catch (error) {
        console.error('EmailJS initialization error');
    }
    toggleForm('login-form');
});

let resetCodeRequests = 0;
const maxRequests = 3;
let resetTimer;
let currentResetCode = null;
let timerInterval;

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

function clearFormFields() {
    const inputs = document.querySelectorAll('.form-container input, .form-container select');
    inputs.forEach(function (input) {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });

    document.getElementById("send-reset-code").innerText = "Send Reset Code";
    document.getElementById("send-reset-code").disabled = false;
    document.getElementById("reset-code-container").style.display = "none";
    document.getElementById("new-password-container").style.display = "none";
    document.getElementById("reset-code-timer").style.display = "none";
}

function handleAccountTypeSelection() {
    document.getElementById('send-reset-code').disabled = false;
}

function sendResetCode() {
    const email = DOMPurify.sanitize(document.getElementById('forgot-email').value);
    if (!email) {
        alert("Please enter your email.");
        return;
    }

    if (resetCodeRequests >= maxRequests) {
        alert("You have reached the maximum number of reset code requests. Try again tomorrow!");
        window.location.href = "homepage.html";
        return;
    }

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

    resetCodeRequests++;
    document.getElementById("reset-code-container").style.display = "block";
    document.getElementById("send-reset-code").innerText = "Code Sent";
    document.getElementById("send-reset-code").disabled = true;
    document.getElementById("reset-code-timer").style.display = "block";
    startTimer(60);
}

function startTimer(duration) {
    let timer = duration;
    const timerDisplay = document.getElementById('timer');
    timerInterval = setInterval(function() {
        timerDisplay.textContent = timer;
        timer--;
        if (timer < 0) {
            clearInterval(timerInterval);
            document.getElementById("send-reset-code").innerText = "Send Reset Code";
            document.getElementById("send-reset-code").disabled = false;
            document.getElementById("reset-code-timer").style.display = "none";
        }
    }, 1000);
}

function stopAndResetTimer() {
    clearInterval(timerInterval);
    const timerDisplay = document.getElementById('timer');
    const resetCodeTimer = document.getElementById('reset-code-timer');
    timerDisplay.textContent = 60;
    if (resetCodeTimer) {
        resetCodeTimer.style.display = "none";
    }
    document.getElementById("send-reset-code").innerText = "Send Reset Code";
    document.getElementById("send-reset-code").disabled = false;
}

function hideResetCodeTimer() {
    const resetCodeTimer = document.getElementById('reset-code-timer');
    if (resetCodeTimer) {
        resetCodeTimer.style.display = "none";
    }
}

function generateRandomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendEmailViaGmail(userEmail) {
    currentResetCode = generateRandomCode();
    const templateParams = {
        to_name: userEmail.split('@')[0],
        from_name: "INNOV8",
        reset_code: currentResetCode,
        to_email: userEmail
    };

    console.log('Sending Gmail reset code');
    emailjs.send('service_4bukh3o', 'template_bii5irp', templateParams, 'Di156Cc3G38LwZQu7')
        .then(function (response) {
            console.log('Gmail reset code sent');
            alert("Reset code sent to your Personal Gmail!");
            window.open("https://accounts.google.com/v3/signin/identifier?ifkv=ASSHykqFTNHjdnsKx1YnzGfpXeDG5f4UBSvxiUXNlonK4tzqQU1oujx1hy0kw3hvDBUO9dDbQ5jh&service=mail&flowName =GlifWebSignIn&flowEntry=ServiceLogin&dsh=S-318472835%3A1741079000234835&ddm=1", "_blank");
        }, function (error) {
            console.error('Error sending reset code');
            let errorMessage = 'Failed to send reset code. ';
            if (error.status === 400) {
                errorMessage += 'Invalid email configuration.';
            } else if (error.status === 401 || error.status === 403) {
                errorMessage += 'Authentication failed.';
            } else if (error.status === 429) {
                errorMessage += 'Too many requests.';
            } else {
                errorMessage += 'Please try again later.';
            }
            alert(errorMessage);
        });
}

function sendEmailViaOutlook(userEmail) {
    currentResetCode = generateRandomCode();
    const templateParams = {
        to_name: userEmail.split('@')[0],
        from_name: "INNOV8",
        reset_code: currentResetCode,
        to_email: userEmail
    };

    console.log('Sending Outlook reset code');
    emailjs.send('service_hqgw71i', 'template_710cf46', templateParams, 'Di156Cc3G38LwZQu7')
        .then(function (response) {
            console.log('Outlook reset code sent');
            alert("Reset code sent to your Student Email!");
            window.open("https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=172&ct=1741079346&rver=7.5.2211.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fnlp%3d1%26cobrandid%3dab0455a0-8d03-46b9-b18b-df2f57b9e44c%26RpsCsrfState%3de6c90a4b-24f6-929a-a597-2d4232b87849&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=ab0455a0-8d03-46b9-b18b-df2f57b9e44c", "_blank");
        }, function (error) {
            console.error('Error sending reset code');
            let errorMessage = 'Failed to send reset code. ';
            if (error.status === 400) {
                errorMessage += 'Invalid email configuration.';
            } else if (error.status === 401 || error.status === 403) {
                errorMessage += 'Authentication failed.';
            } else if (error.status === 412) {
                errorMessage += 'Precondition failed.';
            } else if (error.status === 429) {
                errorMessage += 'Too many requests.';
            } else {
                errorMessage += 'Please try again later.';
            }
            alert(errorMessage);
        });
}

document.getElementById('forgot-personal').addEventListener('click', function() {
    handleAccountTypeSelection();
    toggleForgotPasswordType('personal');
});
document.getElementById('forgot-student').addEventListener('click', function() {
    handleAccountTypeSelection();
    toggleForgotPasswordType('student');
});

function verifyResetCode() {
    const resetCode = DOMPurify.sanitize(document.getElementById('reset-code').value);
    if (!currentResetCode) {
        alert("No reset code was generated. Please request a new code.");
        return;
    }

    if (resetCode === currentResetCode) {
        alert("Authentication Code Correct");
        stopAndResetTimer();
        hideResetCodeTimer();
        document.getElementById("new-password-container").style.display = "block";
        document.getElementById("reset-code-container").style.display = "none";
        document.getElementById('reset-code').value = '';
        currentResetCode = null;
    } else {
        alert("Incorrect Authentication Code. Please enter the 6-digit code sent to your email.");
    }
}

function resetPassword() {
    const email = DOMPurify.sanitize(document.getElementById('forgot-email').value);
    const newPassword = DOMPurify.sanitize(document.getElementById('new-password').value);
    const confirmPassword = DOMPurify.sanitize(document.getElementById('confirm-password').value);

    console.log('Reset password attempt');
    if (newPassword.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    fetch('http://localhost:3002/api/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email,
            newPassword: newPassword
        }),
    })
    .then(response => {
        console.log('Reset password response');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Reset password result');
        if (data.success) {
            alert("Password reset successfully");
            window.location.href = 'login-signup.html';
        } else {
            alert(data.message || 'Failed to reset password');
        }
    })
    .catch(error => {
        console.error('Error resetting password');
        let errorMessage = 'Failed to reset password. ';
        if (error.message.includes('404')) {
            errorMessage += 'User not found.';
        } else if (error.message.includes('400')) {
            errorMessage += 'Invalid request.';
        } else {
            errorMessage += 'Please try again later.';
        }
        alert(errorMessage);
    });
}

function showStudentFields() {
    const studentFields = document.getElementById("student-fields");
    studentFields.style.display = "block";
}

function togglePasswordVisibility(passwordFieldId) {
    const passwordField = document.getElementById(passwordFieldId);
    if (passwordField.type === "password") {
        passwordField.type = "text";
    } else {
        passwordField.type = "password";
    }
}

function toggleSignupType(type) {
    console.log('Toggling signup type');
    if (type === 'personal') {
        document.getElementById('personal-form').style.display = 'block';
        document.getElementById('student-form').style.display = 'none';
        if (document.getElementById('signup-email-student')) {
            document.getElementById('signup-email-student').value = '';
        }
    } else if (type === 'student') {
        document.getElementById('student-form').style.display = 'block';
        document.getElementById('personal-form').style.display = 'none';
        if (document.getElementById('signup-email-personal')) {
            document.getElementById('signup-email-personal').value = '';
        }
    }
}

function toggleForgotPasswordType(type) {
    console.log('Toggling forgot password type');
    if (type === 'personal') {
        if (document.getElementById('forgot-email')) {
            document.getElementById('forgot-email').value = '';
        }
        document.getElementById('reset-code-container').style.display = 'none';
        document.getElementById('new-password-container').style.display = 'none';
        stopAndResetTimer();
        hideResetCodeTimer();
    } else if (type === 'student') {
        if (document.getElementById('forgot-email')) {
            document.getElementById('forgot-email').value = '';
        }
        document.getElementById('reset-code-container').style.display = 'none';
        document.getElementById('new-password-container').style.display = 'none';
        stopAndResetTimer();
        hideResetCodeTimer();
    }
}

function verifyConfirmCodePersonal() {
    const confirmCodeInput = document.getElementById('confirm-code-personal');
    const confirmCode = DOMPurify.sanitize(confirmCodeInput.value);
    const storedCode = window.localStorage.getItem('personal_verification_code');

    if (confirmCode === "") {
        alert("Please enter a confirmation code!");
        return;
    }

    if (confirmCode === storedCode) {
        alert("Code is Valid!");
        document.getElementById('personal-fields').style.display = 'block';
        document.getElementById('confirm-code-container-personal').style.display = 'none';
        window.localStorage.removeItem('personal_verification_code');
    } else {
        alert("Invalid code! Please try again.");
    }
}

function verifyConfirmCodeStudent() {
    const confirmCodeInput = document.getElementById('confirm-code-student');
    const confirmCode = DOMPurify.sanitize(confirmCodeInput.value);
    const storedCode = window.localStorage.getItem('student_verification_code');

    if (confirmCode === "") {
        alert("Please enter a confirmation code!");
        return;
    }

    if (confirmCode === storedCode) {
        alert("Code is Valid!");
        document.getElementById('student-fields').style.display = 'block';
        document.getElementById('confirm-code-container-student').style.display = 'none';
        window.localStorage.removeItem('student_verification_code');
    } else {
        alert("Invalid code! Please try again.");
    }
}

document.getElementById('personal').addEventListener('click', function () {
    toggleSignupType('personal');
});
document.getElementById('student').addEventListener('click', function () {
    toggleSignupType('student');
});

function clearForgotPasswordFields() {
    const forgotEmail = document.getElementById('forgot-email');
    forgotEmail.value = '';
    document.getElementById('reset-code-container').style.display = "none";
    document.getElementById('new-password-container').style.display = "none";
    stopAndResetTimer();
    hideResetCodeTimer();
}

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

async function handleLoginSubmit() {
    const email = DOMPurify.sanitize(document.getElementById("login-email").value);
    const password = DOMPurify.sanitize(document.getElementById("login-password").value);

    console.log('Login attempt');
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    if (adminCredentials.hasOwnProperty(email)) {
        if (password === adminCredentials[email].password) {
            try {
                sessionStorage.setItem('userRole', adminCredentials[email].role);
                sessionStorage.setItem('userEmail', email);
                console.log('Session stored');
                alert(`Login successful! Welcome ${adminCredentials[email].role}!`);
                window.location.href = adminCredentials[email].dashboard;
            } catch (error) {
                console.error('Session storage error');
                alert('Error storing session. Please try again.');
            }
            return;
        } else {
            alert('Invalid admin credentials!');
            return;
        }
    }

    try {
        const response = await fetch('http://localhost:3002/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Login response');
        const data = await response.json();
        console.log('Login response data');
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.success) {
            sessionStorage.setItem('userRole', data.user.role);
            sessionStorage.setItem('userEmail', data.user.email);
            console.log('User data received');
            
            const userDetails = {
                email: data.user.email,
                contact_number: data.user.contact_number || '',
                birthday: data.user.birthday ? new Date(data.user.birthday).toISOString().split('T')[0] : '',
                role: data.user.role,
                age: data.user.age || '',
                gender: data.user.gender || ''
            };
            
            console.log('Storing user details');
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
            
            let redirectUrl;
            switch(data.user.role) {
                case 'outsider':
                    redirectUrl = 'homepage_authorized-user.html';
                    break;
                case 'insider':
                    redirectUrl = 'homepage_authorized-user.html';
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
        console.error('Login error');
        alert(error.message || 'Login failed. Please check your credentials and try again.');
    }
}

function checkAuth() {
    const userRole = sessionStorage.getItem('userRole');
    const userEmail = sessionStorage.getItem('userEmail');
    
    console.log('Checking auth');
    if (!userRole || !userEmail) {
        console.log('Auth failed');
        window.location.href = 'login-signup.html';
        return false;
    }
    console.log('Auth successful');
    return true;
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'login-signup.html';
}

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

async function sendEmailConfirmationPersonal(userEmail) {
    const confirmationCode = generateRandomCode();
    console.log('Preparing personal email');
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
        console.log('Sending email');
        const response = await emailjs.send(
            'service_y36kggk',
            'template_83hocs5',
            templateParams,
            'Db-Ko0z3fyQvrvgSt'
        );
        console.log('Email sent');
        
        window.localStorage.setItem('personal_verification_code', confirmationCode);
        document.getElementById('confirm-code-container-personal').style.display = 'block';
        document.getElementById('confirm-email-btn-personal').disabled = true;
        alert('Confirmation code sent! Please check your email.');
    } catch (error) {
        console.error('Error sending email');
        let errorMessage = 'Failed to send confirmation email. ';
        if (error.status === 400) {
            errorMessage += 'Invalid configuration.';
        } else if (error.status === 401 || error.status === 403) {
            errorMessage += 'Authentication failed.';
        } else if (error.status === 422) {
            errorMessage += 'Invalid email address.';
        } else if (error.status === 429) {
            errorMessage += 'Too many requests.';
        }
        alert(errorMessage);
    }
}

async function sendEmailConfirmationStudent(userEmail) {
    const confirmationCode = generateRandomCode();
    console.log('Preparing student email');
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
        console.log('Sending email');
        const response = await emailjs.send(
            'service_kerpgbj',
            'template_mdsbme2',
            templateParams,
            'Db-Ko0z3fyQvrvgSt'
        );
        console.log('Email sent');
        
        window.localStorage.setItem('student_verification_code', confirmationCode);
        document.getElementById('confirm-code-container-student').style.display = 'block';
        document.getElementById('confirm-email-btn-student').disabled = true;
        alert('Confirmation code sent! Please check your email.');
    } catch (error) {
        console.error('Error sending email');
        let errorMessage = 'Failed to send confirmation email. ';
        if (error.status === 400) {
            errorMessage += 'Invalid configuration.';
        } else if (error.status === 401 || error.status === 403) {
            errorMessage += 'Authentication failed.';
        } else if (error.status === 422) {
            errorMessage += 'Invalid email address.';
        } else if (error.status === 429) {
            errorMessage += 'Too many requests.';
        }
        alert(errorMessage);
    }
}

function checkEmail(accountType) {
    const emailInput = document.getElementById(`signup-email-${accountType}`);
    const confirmBtn = document.getElementById(`confirm-email-btn-${accountType}`);
    const email = DOMPurify.sanitize(emailInput.value.trim());

    if (accountType === 'personal') {
        if (/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email)) {
            confirmBtn.disabled = false;
            return true;
        }
        alert('Please enter a valid Gmail address');
        confirmBtn.disabled = true;
        return false;
    } else if (accountType === 'student') {
        if (/^[rR][a-zA-Z0-9._%+-]*@feuroosevelt\.edu\.ph$/.test(email)) {
            confirmBtn.disabled = false;
            return true;
        }
        alert('Please enter a valid FEU Roosevelt email address');
        confirmBtn.disabled = true;
        return false;
    }
}

function sendEmailConfirmation(accountType) {
    const emailInput = document.getElementById(`signup-email-${accountType}`);
    const email = DOMPurify.sanitize(emailInput.value.trim());

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

function showPersonalForm() {
    document.getElementById('personal-form').style.display = 'block';
    document.getElementById('student-form').style.display = 'none';
    clearFormFields('student-form');
    document.getElementById('personal-fields').style.display = 'none';
    document.getElementById('confirm-code-container-personal').style.display = 'none';
    document.getElementById('student-fields').style.display = 'none';
    document.getElementById('confirm-code-container-student').style.display = 'none';
    document.getElementById('confirm-email-btn-student').disabled = true;
}

function showStudentForm() {
    document.getElementById('student-form').style.display = 'block';
    document.getElementById('personal-form').style.display = 'none';
    clearFormFields('personal-form');
    document.getElementById('student-fields').style.display = 'none';
    document.getElementById('confirm-code-container-student').style.display = 'none';
    document.getElementById('personal-fields').style.display = 'none';
    document.getElementById('confirm-code-container-personal').style.display = 'none';
    document.getElementById('confirm-email-btn-personal').disabled = true;
}

async function handleSignupSubmit(accountType, event) {
    if (!event) {
        console.error('No event provided');
        return;
    }

    event.preventDefault();
    const email = DOMPurify.sanitize(document.getElementById(`signup-email-${accountType}`).value);
    const password = DOMPurify.sanitize(document.getElementById(`signup-password-${accountType}`).value);
    const contact = DOMPurify.sanitize(document.getElementById(`signup-contact-${accountType}`).value);
    
    let additionalData = {};
    if (accountType === 'student') {
        additionalData = {
            birthday: DOMPurify.sanitize(document.getElementById('signup-birthday').value),
            age: DOMPurify.sanitize(document.getElementById('signup-age').value),
            gender: DOMPurify.sanitize(document.getElementById('gender').value)
        };
    }

    if (!email || !password || !contact) {
        alert('Please fill in all required fields.');
        return;
    }

    if (!/^\d{11}$/.test(contact)) {
        alert('Please enter a valid 11-digit contact number.');
        return;
    }

    const agreeCheckbox = document.getElementById(`agree-checkbox-${accountType}`);
    if (!agreeCheckbox.checked) {
        alert('Please accept the terms and conditions.');
        return;
    }

    try {
        const signupData = {
            email,
            password,
            accountType,
            contact_number: contact,
            ...additionalData
        };
        console.log('Signup data sent');
        const response = await fetch('http://localhost:3002/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        console.log('Signup response');
        const data = await response.json();
        console.log('Signup response data');
        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        if (data.success) {
            alert('Signup successful! Please login to continue.');
            window.location.href = 'login-signup.html#login';
            toggleForm('login-form');
        } else {
            throw new Error(data.message || 'Signup failed');
        }
    } catch (error) {
        console.error('Signup error');
        alert(error.message || 'An error occurred during signup. Please try again.');
    }
}
