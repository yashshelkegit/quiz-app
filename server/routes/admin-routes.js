const express = require("express");
const path = require("path");
const router = express.Router();
const fileUpload = require("express-fileupload");

const adminController = require(path.join(
	__dirname,
	"../controllers/admin-controller.js"
));

router.post("/create", fileUpload(), adminController.createQuiz);

module.exports = router;
