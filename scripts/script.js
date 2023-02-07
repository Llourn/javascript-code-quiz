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
WHEN I answer a question incorrectly
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



loop through the questions and generate all the elements needed for each question.
render elements on page as needed.
Add event listener to the parent and use data attributes to check correct answer.
Algorithm for randomizing array order:
const shuffleArray = array => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
I want the answers to have check boxes or radio buttons and a submit button to prevent accidental clicks.

*/

var currentQuestion = 0;
var quizQuestions;
var introEl = document.querySelector("#introduction");
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
  generateQuestion();
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
    announce("❌ Incorrect", "error");
    currentQuestion++;
    resetQuestionArea();
    generateQuestion();
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
