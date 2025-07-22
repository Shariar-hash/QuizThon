// Global variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer = null;
let timeLeft = 0;
let currentDifficulty = '';
let currentUser = null;

// In-memory storage (replace localStorage for Claude artifacts)
let memoryStorage = {
    quizUsers: {},
    currentUser: null
};

// API configuration
const API_BASE = 'https://opentdb.com/api.php';

// Timer durations based on difficulty
const TIMER_DURATIONS = {
    easy: 30,
    medium: 15,
    hard: 10
};

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
    const savedUser = memoryStorage.currentUser;
    if (savedUser) {
        currentUser = savedUser;
        showLoggedInState();
    } else {
        showScreen('authScreen');
    }
}

function toggleAuthForm() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

function continueWithoutLogin() {
    currentUser = null;
    showScreen('setupScreen');
}

async function signup() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Check if user already exists
    const users = memoryStorage.quizUsers;
    if (users[email]) {
        alert('User already exists with this email');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: btoa(password), // Simple encoding (not secure for production)
        createdAt: new Date().toISOString(),
        quizHistory: []
    };
    
    users[email] = newUser;
    memoryStorage.quizUsers = users;
    
    currentUser = newUser;
    memoryStorage.currentUser = currentUser;
    
    showLoggedInState();
    alert('Account created successfully!');
}

async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    
    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    const users = memoryStorage.quizUsers;
    const user = users[email];
    
    if (!user || atob(user.password) !== password) {
        alert('Invalid email or password');
        return;
    }
    
    currentUser = user;
    memoryStorage.currentUser = currentUser;
    
    showLoggedInState();
}

function logout() {
    currentUser = null;
    memoryStorage.currentUser = null;
    showScreen('authScreen');
}

function showLoggedInState() {
    document.getElementById('userName').textContent = currentUser.name;
    showScreen('setupScreen');
    updateHistoryDisplay();
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

function saveQuizResult(percentage, totalQuestions) {
    if (!currentUser) return; // Don't save if not logged in
    
    const categorySelect = document.getElementById('category');
    const categoryText = categorySelect.options[categorySelect.selectedIndex].text;
    
    const quizResult = {
        id: Date.now().toString(),
        category: categoryText,
        difficulty: currentDifficulty,
        score: score,
        totalQuestions: totalQuestions,
        percentage: percentage,
        date: new Date().toISOString(),
        timestamp: Date.now()
    };
    
    currentUser.quizHistory.unshift(quizResult); // Add to beginning of array
    
    // Update memory storage
    const users = memoryStorage.quizUsers;
    users[currentUser.email] = currentUser;
    memoryStorage.quizUsers = users;
    memoryStorage.currentUser = currentUser;
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
    document.getElementById('nextBtn').style.display = 'block';
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    
    // Reset answer options
    document.querySelectorAll('.answer-option').forEach(btn => {
        btn.classList.remove('selected', 'correct', 'incorrect', 'disabled');
    });
    
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
});

// Clear form inputs when switching between login/signup
document.addEventListener('DOMContentLoaded', function() {
    const clearForms = () => {
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('signupName').value = '';
        document.getElementById('signupEmail').value = '';
        document.getElementById('signupPassword').value = '';
    };
    
    // You can call clearForms() when needed
});