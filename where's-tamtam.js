const audio = document.getElementById('backgroundMusic');

// Function to start playing music when the game starts
function startMusic() {
    audio.play();
    audio.volume = 0.2; // Set the volume to 20%
}

// Function to stop the music when the game ends or the user exits
function stopMusic() {
    audio.pause();
    audio.currentTime = 0; // Reset the audio to the beginning
}

const backgrounds = [
    "bg-tamtam-1.jpg",
    "bg-tamtam-2.jpg",
    "bg-tamtam-3.jpg"
];

const totalImages = 9; // 3x3 grid layout
const correctImageSrc = "tamtam.png"; // Ensure this file exists
const imageGrid = document.getElementById('imageGrid');
const timerElement = document.getElementById('timer');
const resultMessage = document.getElementById('resultMessage');
const playGameDiv = document.getElementById('playGameDiv');
const playAgainDiv = document.getElementById('playAgainDiv');
const startGameBtn = document.getElementById('startGameBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const exitGameBtn = document.getElementById('exitGameBtn');

// Get the header element to change the text
const header = document.querySelector('h1');

// Score Counter
let score = 0;
const scoreLabel = document.createElement('div');
scoreLabel.id = "scoreLabel";
scoreLabel.textContent = `Your Score: ${score}`;
document.body.insertBefore(scoreLabel, document.body.firstChild); // Place at the top

let timeLeft = 30; // Initial time
let countdown;
let targetImageElement;

let clicked = false; // Track user clicks to prevent multiple clicks

// Initialize high score from localStorage
let highScore = parseInt(localStorage.getItem('wherestamtam_highscore')) || 0;

// Function to start a new round (without resetting the timer)
function startGame() {
    // Change the header text to "Find Tamtam!" when the game starts
    header.textContent = "Find Tamtam!";

    // Hide the play game button and show the timer and grid
    playGameDiv.style.display = "none";
    imageGrid.style.display = "block";
    timerElement.style.display = "block";

    imageGrid.innerHTML = ""; // Clear previous images
    resultMessage.textContent = ""; // Reset result message

    // Apply a random background image
    const randomBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    imageGrid.style.backgroundImage = `url(${randomBg})`;
    imageGrid.style.backgroundSize = "cover"; // Ensure the background covers the grid

    // Create an array of positions and shuffle them for the grid
    let positions = Array.from({ length: totalImages }, (_, i) => i);
    positions = positions.sort(() => Math.random() - 0.5);

    // Select a **random position** for the correct image in the grid
    const correctPosition = positions.pop();

    // Add the correct image and other images to the grid
    for (let i = 0; i < totalImages; i++) {
        const div = document.createElement('div');
        div.classList.add('image-box');

        // Only insert the tamtam.png in the randomly chosen cell
        if (i === correctPosition) {
            div.dataset.correct = "true";
            div.innerHTML = `<img src="${correctImageSrc}" alt="Target Image">`;
            // Store the target image element to highlight it later
            targetImageElement = div.querySelector('img');
        }

        imageGrid.appendChild(div);
    }

    // Track user clicks
    clicked = false;

    // Remove previous event listener to prevent multiple firing
    imageGrid.removeEventListener('click', handleImageClick);

    // Add new event listener for the image grid
    imageGrid.addEventListener('click', handleImageClick);

    // Start Timer if not already running
    if (!countdown) {
        countdown = setInterval(() => {
            timeLeft--;
            timerElement.textContent = `Time left: ${timeLeft}s`;

            if (timeLeft <= 0) {
                clearInterval(countdown);
                countdown = null;
                resultMessage.className = "fail";

                // Call endGame with final score
                endGame(score);

                // Show Play Again Div inside the modal
                playAgainDiv.style.display = "block";
                showModal(); // Ensure the modal is visible
                stopMusic();

                // Change header text back to default when time runs out
                header.textContent = "Where's Tamtam?";
            }
        }, 1000);
    }
    startMusic();
}

// Handle image click logic separately
function handleImageClick(event) {
    if (clicked) return; // Prevent multiple clicks per round

    clicked = true; // Mark as clicked to prevent further clicks

    if (event.target.tagName === "IMG" && event.target.src.includes(correctImageSrc)) {
        score += 5; // Increase score
        timeLeft += 6; // Add 6 extra seconds
        scoreLabel.textContent = `Your Score: ${score}`;
        resultMessage.textContent = "✅ Correct! You found Tamtam!";
        resultMessage.className = "success";
        displayScoreCorrectMessage("+5");

        setTimeout(startGame, 1000); // Start new round after 1 second
    } else {
        resultMessage.textContent = "❌ Wrong! That's not Tamtam!";
        resultMessage.className = "fail";
        displayScoreWrongMessage("-2");

        // Deduct 2 seconds for the wrong click
        timeLeft = Math.max(timeLeft - 2, 0); // Ensure time doesn't go negative
        timerElement.textContent = `Time left: ${timeLeft}s`;

        setTimeout(startGame, 1000); // Start new round after 1 second
    }
}

// Function to reset and start a new game or play again
function playAgain() {
    // Reset header text to "Find Tamtam!" when the play again button is clicked
    header.textContent = "Find Tamtam!";

    // Hide the Play Again section
    playAgainDiv.style.display = "none";

    // Reset score and update the score label
    score = 0;
    scoreLabel.textContent = `Your Score: ${score}`;

    // Reset time left and update the timer display
    timeLeft = 30;
    timerElement.textContent = `Time left: ${timeLeft}s`;

    // Clear previous countdown interval
    if (countdown) {
        clearInterval(countdown);
        countdown = null;
    }

    // Start a new game (Initialize or reset game state)
    startGame(); // Assuming startGame initializes the game elements like the image grid
    startMusic(); // Assuming startMusic starts the background music
}

// Function to show the modal
function showModal() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'flex'; // Display the modal as a flex container
}

// Function to hide the modal
function hideModal() {
    const modal = document.getElementById('gameModal');
    modal.style.display = 'none'; // Hide the modal
}

// Event listeners for buttons in the modal
startGameBtn.addEventListener('click', function() {
    hideModal(); // Hide modal when the game starts
    startGame(); // Start the game
    startMusic();
});

playAgainBtn.addEventListener('click', function() {
    hideModal(); // Hide modal when play again is clicked
    playAgain(); // Restart the game
    startMusic();
});

exitGameBtn.addEventListener('click', function() {
    window.close(); // Close the window when exit is clicked (if applicable)
    stopMusic();
});

// Show the modal on load
window.onload = showModal;

// Get modal, buttons, and close button elements
const howToPlayBtn = document.getElementById('howToPlayBtn');
const howToPlayModal = document.getElementById('howToPlayModal');
const closeHowToPlayBtn = document.getElementById('closeHowToPlayBtn');

// Show modal when "How to Play" button is clicked
howToPlayBtn.addEventListener('click', function() {
    howToPlayModal.style.display = 'flex';
});

// Close modal when "Close" button is clicked
closeHowToPlayBtn.addEventListener('click', function() {
    howToPlayModal.style.display = 'none';
});

// Example: Show result message
document.getElementById('resultMessage').style.display = 'block';

// Function to display score change message
function displayScoreCorrectMessage(change) {
    const messageDiv = document.getElementById("scoreCorrectMessage");
    messageDiv.textContent = change;
    messageDiv.style.display = "block";

    // Hide message after 1 second
    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 1000);
}

// Function to display score change message
function displayScoreWrongMessage(change) {
    const messageDiv = document.getElementById("scoreWrongMessage");
    messageDiv.textContent = change;
    messageDiv.style.display = "block";

    // Hide message after 1 second
    setTimeout(() => {
        messageDiv.style.display = "none";
    }, 1000);
}

function endGame(score) {
    // Update high score if needed
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('wherestamtam_highscore', highScore);
        
        // Update Manage Account if it's open
        if (window.opener && !window.opener.closed) {
            window.opener.updateHighScore(highScore);
        }
    }
    
    // Save last played date
    const lastPlayed = new Date().toLocaleDateString();
    localStorage.setItem('wherestamtam_lastplayed', lastPlayed);
    
    // Update Manage Account
    updateManageAccountScore();
    
    // Show game over message with the score
    alert(`Game Over! Your score: ${score}\nHigh Score: ${highScore}`);
    
    // Reset game state
    resetGame();
}

// Add this function to update high score in Manage Account
function updateManageAccountScore() {
    if (window.opener && !window.opener.closed) {
        window.opener.updateHighScore(highScore);
        window.opener.document.getElementById('last-played-date').textContent = new Date().toLocaleDateString();
    }
}

// Call this function when the game loads to sync with Manage Account
window.addEventListener('load', function() {
    updateManageAccountScore();
});