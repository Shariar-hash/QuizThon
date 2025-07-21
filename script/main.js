// Global variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer = null;
let timeLeft = 0;
let currentDifficulty = '';

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
