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

// BUG: when you're the first one to record a score it doesn't show the leaderboard.

// flag used to assist with debugging.
const debugMode = false;

// Variables
const timerStartValue = 60;
var timeLeft = timerStartValue;
var timerInterval;
var currentQuestion = 0;
var correctAnswers = 0;
var scoreSubmitEvent;
var quizQuestions;
var leaderboard;

// HTML elemements
var introEl = document.querySelector("#introduction");
var timerEl = document.querySelector("#timer");
var questionEl = document.querySelector("#question");
var questionTextEl = document.querySelector("#question-text");
var optionsEl = document.querySelector("#options");
var messageEl = document.querySelector("#message");
var resultsEl = document.querySelector("#results");
var leaderboardEl = document.querySelector("#leaderboard");
var showLeaderboardLink = document.querySelector("#show-leaderboard");

// initialize app
async function init() {
  // retrieve questions
  var response = await fetch("./data/test-questions.json");
  var data = await response.json();
  quizQuestions = data.questions;

  // retrieve leaderboard entries
  leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
  if (leaderboard === null) leaderboard = [];

  showLeaderboardLink.addEventListener("click", function (event) {
    displayLeaderboard(false);
  });

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
  showLeaderboardLink.classList.add("deactivated");
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
    announceResult(
      "???? No option selected, please select an option to continue.",
      "error"
    );
  } else {
    if (checkedOption.value === quizQuestions[currentQuestion].answer) {
      correctAnswers++;
      announceResult("?????? Correct", "success");
    } else {
      timePenalty(5);
      announceResult("??? Incorrect", "error");
    }

    currentQuestion++;
    resetElementAreas([questionTextEl, optionsEl]);

    if (currentQuestion < quizQuestions.length) {
      generateQuestion();
    } else if (timeLeft > 0) {
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
    timeRemaining: timeLeft,
    latestEntry: true,
  });

  leaderboard = leaderboard.sort((a, b) => {
    return (
      b.scoreInPercent - a.scoreInPercent || b.timeRemaining - a.timeRemaining
    );
  });

  if (leaderboard.length > 10) leaderboard.pop();
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
    message = "?????? You ran out of time.";
  } else if (currentQuestion >= quizQuestions.length) {
    if (scoreInPercent() === 100) {
      message = "???? You aced the quiz! ????";
    } else {
      message = "???? You've answered all the questions!";
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
  inputEl.maxLength = 3;
  inputEl.placeholder = "Enter your initials";

  var submitEl = document.createElement("button");
  submitEl.type = "submit";
  submitEl.textContent = "Submit";
  formEl.append(inputEl);
  formEl.append(submitEl);
  resultsEl.append(formEl);
}

function displayLeaderboard(showLatest = true) {
  showLeaderboardLink.classList.add("deactivated");
  // first create the header to the leaderboard.
  const headerEl = createLeaderboardEntry("NAME", "TIME", "SCORE");
  leaderboardEl.append(headerEl);

  // create the leaderboard entries.
  for (let i = 0; i < leaderboard.length; i++) {
    const entry = leaderboard[i];
    const firstColumnText = `${i + 1}. ${entry.initials}`;
    const secondColumnText = `${entry.timeRemaining}s`;
    const thirdColumnText = `${entry.scoreInPercent}%`;

    const entryEl = createLeaderboardEntry(
      firstColumnText,
      secondColumnText,
      thirdColumnText
    );

    if (entry.latestEntry && showLatest) entryEl.classList.add("latest-entry");
    leaderboardEl.append(entryEl);
  }
}

function createLeaderboardEntry(firstCol, secondCol, thirdCol) {
  var entryEl = document.createElement("div");

  var firstColumnEl = document.createElement("span");
  firstColumnEl.textContent = firstCol;
  entryEl.append(firstColumnEl);

  var secondColumnEl = document.createElement("span");
  secondColumnEl.textContent = secondCol;
  entryEl.append(secondColumnEl);

  var thirdColumnEl = document.createElement("span");
  thirdColumnEl.textContent = thirdCol;
  entryEl.append(thirdColumnEl);

  return entryEl;
}

function announceResult(message, modifier) {
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
