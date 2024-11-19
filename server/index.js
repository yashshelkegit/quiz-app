const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require(path.join(__dirname, "/routes/admin-routes.js"));
const quizRoutes = require(path.join(__dirname, "/routes/quiz-routes.js"));

app.use(cors());
app.use(express.json());

mongoose
	.connect("mongodb://localhost:27017/yashdb")
	.then(console.log("db connected"));

app.use("/admin/quiz", adminRoutes);
app.use("/quiz", quizRoutes);


app.listen(3000, () => {
	console.log("App started");
});
