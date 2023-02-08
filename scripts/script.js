/*
User Story
AS A coding boot camp student
I WANT to take a timed quiz on JavaScript fundamentals that stores high scores
  SO THAT I can gauge my progress compared to my peers

Acceptance Criteria
GIVEN I am taking a code quiz
✅ WHEN I click the start button
  THEN a timer starts and I am presented with a question
✅ WHEN I answer a question
  THEN I am presented with another question
✅ WHEN I answer a question incorrectly
  THEN time is subtracted from the clock
✅ WHEN all questions are answered or the timer reaches 0
  THEN the game is over
WHEN the game is over
  THEN I can save my initials and my score

Acceptance Criteria+
GIVEN I am taking a code quiz
WHEN I retake the quiz
THEN the answers in a different order
✅ WHEN I am presented with a question
  THEN to answer I select an option and click submit button to confirm choice



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
const debugMode = true;

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

async function init() {
  // retrieve questions
  var response = await fetch("./data/questions.json");
  var data = await response.json();
  console.log(data.questions);
  quizQuestions = data.questions;

  // retrieve leaderboard entries
  leaderboard = JSON.parse(localStorage.getItem("leaderboard"));
  if (leaderboard === null) leaderboard = [];
}

init();

document.querySelector("#start").addEventListener("click", function () {
  startQuiz();
});

questionEl.addEventListener("click", function (event) {
  console.log(event.target.id);
  if (event.target.id === "submit") {
    checkAnswer();
  }
});

function resetQuestionArea() {
  questionTextEl.querySelectorAll("*").forEach((el) => el.remove());
  optionsEl.querySelectorAll("*").forEach((el) => el.remove());
}

document
  .querySelector("#test-start-button")
  .addEventListener("click", function () {
    startQuiz();
  });

document
  .querySelector("#test-end-button")
  .addEventListener("click", function () {
    // correctAnswers = quizQuestions.length - 1;
    // currentQuestion = quizQuestions.length;
    gameOver();
  });

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
  updateTimer();
  while (resultsEl.firstChild) {
    resultsEl.firstChild.remove();
  }
  while (leaderboardEl.firstChild) {
    leaderboardEl.firstChild.remove();
  }
}

function startTimer() {
  updateTimer();
  timeLeft = timerStartValue;
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) gameOver();
  }, 1000);
}

function generateQuestion() {
  var textEl = document.createElement("p");
  textEl.innerHTML = quizQuestions[currentQuestion].question;

  questionTextEl.append(textEl);
  generateOptions();
}

function generateOptions() {
  var options = quizQuestions[currentQuestion].options;
  var optionsHTML = "";
  options.forEach((option, index) => {
    if (debugMode && quizQuestions[currentQuestion].answer == index)
      option += " [ANSWER]";
    optionsHTML += `<input id="option-${index}" type="radio" name="options" value="${index}"><label for="option-${index}">${option}</label><br>`;
  });
  optionsEl.innerHTML = optionsHTML;
}

function checkAnswer() {
  var checkedOption = optionsEl.querySelector('input[name="options"]:checked');
  if (checkedOption === null) {
    announce(
      "🚫 No option selected, please select an option to continue.",
      "error"
    );
  } else if (checkedOption.value === quizQuestions[currentQuestion].answer) {
    console.log("Correct");
    announce("✔️ Correct", "success");
    currentQuestion++;
    correctAnswers++;
    resetQuestionArea();
    if (currentQuestion <= quizQuestions.length) {
      generateQuestion();
    } else {
      gameOver();
    }
  } else {
    console.log("Incorrect");
    timePenalty(5);
    announce("❌ Incorrect", "error");
    currentQuestion++;
    resetQuestionArea();
    generateQuestion();
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
  updateTimer();
}

function updateTimer() {
  timerEl.textContent = `Time remaining: ${timeLeft}s`;
}

function gameOver() {
  clearInterval(timerInterval);
  var message;
  var score = Math.floor((correctAnswers / quizQuestions.length) * 10000) / 100;
  if (timeLeft <= 0) {
    message = "⏱️ You ran out of time.";
  } else if (currentQuestion >= quizQuestions.length) {
    console.log(score);
    if (score === 100) {
      message = "🎉 You aced the quiz! 🎉";
    } else {
      message = "👏 You've answered all the questions!";
    }
  }
  // clear the question section
  document.querySelector("#question").style.display = "none";

  // header with the message
  var titleEl = document.createElement("h3");
  titleEl.textContent = message;
  resultsEl.append(titleEl);
  // display Score: xx%
  var scoreEl = document.createElement("p");
  scoreEl.textContent = `Score: ${score}%`;
  resultsEl.append(scoreEl);
  // form for initials and submit button.
  var formEl = document.createElement("form");
  formEl.addEventListener("submit", function (event) {
    event.preventDefault();
    leaderboard.push({
      initials: event.target[0].value.toUpperCase(),
      scoreInPercent: score,
    });
    if (leaderboard.length > 10) leaderboard.shift();
    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    displayLeaderboard();
  });
  var inputEl = document.createElement("input");
  inputEl.type = "text";
  inputEl.placeholder = "Enter your initials";
  var submitEl = document.createElement("input");
  submitEl.type = "submit";
  submitEl.value = "Submit";
  formEl.append(inputEl);
  formEl.append(submitEl);
  resultsEl.append(formEl);
}

function displayLeaderboard() {
  for (let i = leaderboard.length - 1; i >= 0; i--) {
    const entry = leaderboard[i];
    var entryEl = document.createElement("div");
    entryEl.append(
      (document.createElement("span").textContent = `${Math.abs(
        i - leaderboard.length
      )}. ${entry.initials}`)
    );
    entryEl.append(
      (document.createElement("span").textContent = `${entry.scoreInPercent}%`)
    );
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
