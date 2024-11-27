const express = require("express");
const { Quiz } = require("../models/quiz-model");

module.exports.getQuiz = async (req, res) => {
	try {
		const quizId = req.params.id;

		const quiz = await Quiz.findOne({ id: Number(quizId) });

		if (!quiz) {
			return res.status(404).json({
				success: false,
				message: "Quiz not found",
			});
		}
		res.json(quiz);
	} catch (error) {
		console.error("Error fetching quiz:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch quiz",
			error: error.message,
		});
	}
};

module.exports.getQuizzes = async (req, res) => {
	try {
		const quizzes = await Quiz.find({ active: true });
        // console.log(quizzes)
		res.json(quizzes);
	} catch (error) {
		console.error("Error fetching quizzes:", error);
		res.status(500).json({
			success: false,
			message: "Failed to fetch quizzes",
			error: error.message,
		});
	}
};

module.exports.deleteQuiz = async (req, res) => {
	try {
		const quizId = req.params.id;

		// Find and delete the quiz
		const deletedQuiz = await Quiz.findOneAndDelete({ id: Number(quizId) });

		if (!deletedQuiz) {
			return res.status(404).json({
				success: false,
				message: "Quiz not found",
			});
		}

		res.json({
			success: true,
			message: "Quiz deleted successfully",
			deletedQuiz,
		});
	} catch (error) {
		console.error("Error deleting quiz:", error);
		res.status(500).json({
			success: false,
			message: "Failed to delete quiz",
			error: error.message,
		});
	}
};