/*
User Story
AS A coding boot camp student
I WANT to take a timed quiz on JavaScript fundamentals that stores high scores
  SO THAT I can gauge my progress compared to my peers

Acceptance Criteria
GIVEN I am taking a code quiz
WHEN I click the start button
  THEN a timer starts and I am presented with a question
✅ WHEN I answer a question
  THEN I am presented with another question
✅ WHEN I answer a question incorrectly
  THEN time is subtracted from the clock
WHEN all questions are answered or the timer reaches 0
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

const timerStartValue = 60;
var timeLeft = timerStartValue;
var timerInterval;
var currentQuestion = 0;
var quizQuestions;
var introEl = document.querySelector("#introduction");
var timerEl = document.querySelector("#timer");
var questionEl = document.querySelector("#question");
var questionTextEl = document.querySelector("#question-text");
var optionsEl = document.querySelector("#options");
var messageEl = document.querySelector("#message");

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

async function startQuiz() {
  introEl.style.display = "none";
  questionEl.style.display = "block";
  var response = await fetch("./data/questions.json");
  var data = await response.json();
  console.log(data.questions);
  quizQuestions = data.questions;
  startTimer();
  generateQuestion();
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
  console.log(quizQuestions[currentQuestion].question);
  console.log(textEl);
  textEl.innerHTML = quizQuestions[currentQuestion].question;
  console.log(textEl);

  questionTextEl.append(textEl);
  generateOptions();
}

function generateOptions() {
  var options = quizQuestions[currentQuestion].options;
  var optionsHTML = "";
  options.forEach((option, index) => {
    optionsHTML += `<input id="option-${index}" type="radio" name="options" value="${index}"><label for="option-${index}">${option}</label><br>`;
  });
  optionsEl.innerHTML = optionsHTML;
}

function checkAnswer() {
  var checkedOption = optionsEl.querySelector('input[name="options"]:checked');
  console.log(checkedOption);
  if (checkedOption === null) {
    announce(
      "🚫 No option selected, please select an option to continue.",
      "error"
    );
  } else if (checkedOption.value === quizQuestions[currentQuestion].answer) {
    console.log("Correct");
    announce("✔️ Correct", "success");
    currentQuestion++;
    resetQuestionArea();
    generateQuestion();
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
  // clear the question section
  // display the results and game over message
  // provide area to enter initials
  // save initials and score and display on score board.
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
