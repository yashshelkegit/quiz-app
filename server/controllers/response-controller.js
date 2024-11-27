const express = require("express");
const nodemailer = require("nodemailer");
const { QuizResponse } = require("../models/response-model");
// const { Quiz } = require("../models/quiz-model");

module.exports.submitQuiz = async (req, res) => {
    try{
        const response = await new QuizResponse(req.body);
        const ack = await response.save();
        console.log(ack)
        res.json(ack)
    } catch (e){
        res.json({error: true})
    }
}

module.exports.getResponse = async (req, res) => {
  try {
    const { subject } = req.query;
    const query = subject ? { subject: subject.toUpperCase() } : {};
    
    const responses = await QuizResponse.find(query).sort({ totalScore: -1 });
    
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz responses', error: error.message });
  }
}

module.exports.getSubject = async (req, res) => {
	try {
		const subjects = await QuizResponse.distinct("subject");
		res.json(subjects || []); // Ensure an array is always sent
	} catch (error) {
		res
			.status(500)
			.json({ message: "Error fetching subjects", error: error.message });
	}
};

module.exports.sendResults = async (req, res) => {
	const { subject, responses } = req.body;
    console.log("object")
	// Configure nodemailer transporter
	let transporter = nodemailer.createTransport({
		service: "gmail", // Or your email service
		auth: {
			user: "yashshelke885@gmail.com",
			pass: "oaxw pdcv rhgp omhs", // Use app password for security
		},
	});

	try {
		// Send emails to each student
		const emailPromises = responses.map(async (response) => {
			const mailOptions = {
				from: "yashshelke885@gmail.com",
				to: response.studentData.email,
				subject: `Quiz Results for ${subject}`,
				html: `
          <h1>Quiz Result</h1>
          <p>Dear ${response.studentData.name},</p>
          <p>Your quiz results for ${subject} are as follows:</p>
          <ul>
            <li>Total Score: ${response.totalScore}</li>
            <li>Exam Date: ${new Date(response.endTime).toLocaleString()}</li>
          </ul>
          <p>Best regards,<br>YCCE, Nagpur</p>
        `,
			};

			return transporter.sendMail(mailOptions);
		});

		// Wait for all emails to be sent
		await Promise.all(emailPromises);

		res.status(200).json({ message: "Emails sent successfully" });
	} catch (error) {
		console.error("Error sending emails:", error);
		res
			.status(500)
			.json({ message: "Failed to send emails", error: error.message });
	}
};