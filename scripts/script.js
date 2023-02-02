fetch("./data/questions.json")
  .then((response) => response.json())
  .then((json) => startQuiz(json.questions));

function startQuiz(questions) {
  console.log(questions);
  console.log(questions[0].question);
}
