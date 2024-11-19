const express = require("express");
const {Quiz} = require("../models/quiz-model");


module.exports.createQuiz = async (req, res) => {
	try {
		const {
			title,
			subject,
			branch,
			academicYear,
			duration,
			startTime,
			endTime,
		} = req.body;

		const quizData = req.files.quizFile;

		const questionsData = JSON.parse(quizData.data.toString());

		const id = Date.now();

		const shareableLink = `${process.env.BASE_URL}/quiz/${id}`;

		const quiz = new Quiz({
			id,
			title,
			questions: questionsData.questions.map((q, index) => ({
				id: index + 1,
				text: q.text,
				options: q.options,
				answer: q.answer,
				points: q.points,
			})),
			duration: parseInt(duration),
			createdBy: req.user?.id || "admin", // authentication
			shareableLink,
			active: true,
			createdAt: new Date(),
			subject,
			branch,
			academicYear,
			startTime,
			endTime,
		});

		await quiz.save();

		res.status(201).json({
			success: true,
			message: "Quiz created successfully",
			quiz: {
				id: quiz.id,
				title: quiz.title,
				shareableLink: quiz.shareableLink,
				duration: quiz.duration,
				startTime: quiz.startTime,
				endTime: quiz.endTime,
			},
		});
	} catch (error) {
		console.error("Error creating quiz:", error);
		res.status(500).json({
			success: false,
			message: "Failed to create quiz",
			error: error.message,
		});
	}
};

