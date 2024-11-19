const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
	id: Number,
	title: String,
	questions: [
		{
			id: Number,
			text: String,
			options: [String],
			answer: String,
			points: Number,
		},
	],
	duration: Number,
	createdBy: String,
	shareableLink: String,
	active: Boolean,
	createdAt: Date,
});
const Quiz = mongoose.model("Quiz", quizSchema)
module.exports = {
	Quiz,
}
