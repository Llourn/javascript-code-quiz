/*
Additional criteria I'd like to implement.
GIVEN I am taking a code quiz
WHEN I retake the quiz
THEN the answers in a different order

Algorithm for randomizing array order:
const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
*/
// flag used to assist with debugging.
const debugMode = false;

const timerStartValue = 60;
var timeLeft = timerStartValue;
var timerInterval;
var currentQuestion = 0;
var correctAnswers = 0;
var scoreSubmitEvent;
var quizQuestions;
var leaderboard;

var introEl = document.querySelector("#introduction");
var timerEl = document.querySelector("#timer");
var questionEl = document.querySelector("#question");
var questionTextEl = document.querySelector("#question-text");
var optionsEl = document.querySelector("#options");
var messageEl = document.querySelector("#message");
var resultsEl = document.querySelector("#results");
var leaderboardEl = document.querySelector("#leaderboard");

// initialize app
async function init() {
  // retrieve questions
  var response = await fetch("./data/test-questions.json");
  var data = await response.json();
  quizQuestions = data.questions;

  // retrieve leaderboard entries
  leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
  if (leaderboard === null) leaderboard = [];

  document.querySelector("#start").addEventListener("click", function () {
    startQuiz();
  });

  questionEl.addEventListener("click", function (event) {
    if (event.target.id === "submit") {
      checkAnswer();
    }
  });
}

init();

// operational logic
function startQuiz() {
  resetQuiz();
  startTimer();
  generateQuestion();
}

function resetQuiz() {
  currentQuestion = 0;
  correctAnswers = 0;
  introEl.style.display = "none";
  questionEl.style.display = "block";
  messageEl.textContent = "";
  timeLeft = timerStartValue;
  updateTimerEl();
  resetElementAreas([resultsEl, leaderboardEl]);
}

function startTimer() {
  updateTimerEl();
  timeLeft = timerStartValue;
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerEl();
    if (timeLeft <= 0) gameOver();
  }, 1000);
}

function checkAnswer() {
  var checkedOption = optionsEl.querySelector('input[name="options"]:checked');
  if (checkedOption === null) {
    announce(
      "🚫 No option selected, please select an option to continue.",
      "error"
    );
  } else {
    if (checkedOption.value === quizQuestions[currentQuestion].answer) {
      correctAnswers++;
      announce("✔️ Correct", "success");
    } else {
      timePenalty(5);
      announce("❌ Incorrect", "error");
    }

    currentQuestion++;
    resetElementAreas([questionTextEl, optionsEl]);

    if (currentQuestion < quizQuestions.length) {
      generateQuestion();
    } else {
      gameOver();
    }
  }
}

function timePenalty(amountInSeconds) {
  timeLeft -= amountInSeconds;
  if (timeLeft - amountInSeconds < 0) {
    timeLeft = 0;
    gameOver();
  } else {
    timeLeft -= amountInSeconds;
  }
  updateTimerEl();
}

function updateAndSaveLeaderboard(event) {
  leaderboard.forEach((entry) => {
    entry.latestEntry = false;
  });

  leaderboard.push({
    initials: event.target[0].value.toUpperCase(),
    scoreInPercent: scoreInPercent(),
    latestEntry: true,
  });
  if (leaderboard.length > 10) leaderboard.shift();
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function scoreInPercent() {
  return Math.floor((correctAnswers / quizQuestions.length) * 100);
}

// dom manipulation logic
function resetElementAreas([...areas]) {
  areas.forEach((area) => {
    area.querySelectorAll("*").forEach((el) => el.remove());
  });
}

function generateQuestion() {
  var textEl = document.createElement("p");
  textEl.innerHTML = `Question ${currentQuestion + 1}: ${
    quizQuestions[currentQuestion].question
  }`;

  questionTextEl.append(textEl);
  generateOptionsEl();
}

function generateOptionsEl() {
  var options = quizQuestions[currentQuestion].options;
  var optionsHTML = "";
  options.forEach((option, index) => {
    if (debugMode && quizQuestions[currentQuestion].answer == index)
      option += " [ANSWER]";
    optionsHTML += `<div><input id="option-${index}" type="radio" name="options" value="${index}"><label for="option-${index}">${option}</label></div>`;
  });
  optionsEl.innerHTML = optionsHTML;
}

function updateTimerEl() {
  if (timerEl.style.display === "none") timerEl.style.display = "block";
  timerEl.textContent = `Time remaining: ${timeLeft}s`;
}

function gameOver() {
  clearInterval(timerInterval);
  var message;
  if (timeLeft <= 0) {
    message = "⏱️ You ran out of time.";
  } else if (currentQuestion >= quizQuestions.length) {
    if (scoreInPercent() === 100) {
      message = "🎉 You aced the quiz! 🎉";
    } else {
      message = "👏 You've answered all the questions!";
    }
  }
  // Hide the question section, including the answer submit button
  document.querySelector("#question").style.display = "none";

  // Create the message element and append it to the results element.
  var titleEl = document.createElement("h3");
  titleEl.textContent = message;
  resultsEl.append(titleEl);

  // Create the score elements and append it to the results element.
  var scoreEl = document.createElement("p");
  scoreEl.textContent = `Score: ${scoreInPercent()}%`;
  resultsEl.append(scoreEl);

  // Create the form element and append the text input and submit button elements.
  var formEl = document.createElement("form");
  formEl.addEventListener("submit", function (event) {
    event.preventDefault();
    introEl.style.display = "block";
    timerEl.style.display = "none";
    updateAndSaveLeaderboard(event);
    displayLeaderboard();
    resetElementAreas([resultsEl]);
  });

  var inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.placeholder = "Enter your initials";

  var submitEl = document.createElement("button");
  submitEl.type = "submit";
  submitEl.textContent = "Submit";
  formEl.append(inputEl);
  formEl.append(submitEl);
  resultsEl.append(formEl);
}

// Sorts leaderboard from highest to lowest score and displays it.
function displayLeaderboard() {
  var sortedLeaderboard = leaderboard.sort((a, b) => {
    return b.scoreInPercent - a.scoreInPercent;
  });

  for (let i = 0; i < sortedLeaderboard.length - 1; i++) {
    const entry = sortedLeaderboard[i];
    var entryEl = document.createElement("div");

    if (entry.latestEntry) entryEl.classList.add("latest-entry");

    var initialSpanEl = document.createElement("span");
    initialSpanEl.textContent = `${i + 1}. ${entry.initials}`;
    entryEl.append(initialSpanEl);

    var scoreSpanEl = document.createElement("span");
    scoreSpanEl.textContent = `${entry.scoreInPercent}%`;
    entryEl.append(scoreSpanEl);

    leaderboardEl.append(entryEl);
  }
}

function announce(message, modifier) {
  messageEl.className = "message";

  if (modifier === "error") {
    messageEl.classList.add("error");
  } else if (modifier === "success") {
    messageEl.classList.add("success");
  }

  messageEl.textContent = message;
  setTimeout(() => {
    messageEl.classList.add("fade-animation");
  }, 1);
}
