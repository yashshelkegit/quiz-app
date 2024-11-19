const express = require("express");
const path = require("path");

const router = express.Router();

const quizController = require(path.join(
	__dirname,
	"../controllers/quiz-controller.js"
));

router.get("/quizzes", quizController.getQuizzes);
router.get("/:id", quizController.getQuiz);

module.exports = router;
