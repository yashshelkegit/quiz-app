const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
	id: String,
	quizId: Number,
	studentData: {
		id: Number,
		name: String,
		email: String,
		branch: String,
		section: String,
		rollNo: Number,
		regNo: Number,
		academicYear: Number,
	},
	quizMongoId: mongoose.Schema.Types.ObjectId,
	violations: Number,
	studentId: Number,
	subject: String,
	studentEmail: String,
	answers: [
		{
			queId: Number,
			selectedAnswer: String,
			isCorrect: Boolean,
		},
	],
	totalScore: Number,
	startTime: Date,
	endTime: Date,
});

const QuizResponse = mongoose.model("QuizResponse", responseSchema);

module.exports = {
	QuizResponse,
};
