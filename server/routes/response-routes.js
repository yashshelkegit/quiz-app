const express = require("express");
const responseController = require("../controllers/response-controller");

const router = express.Router();


router.get('/responses', responseController.getResponse);
router.get('/subjects', responseController.getSubject);
router.post("/submit", responseController.submitQuiz);
router.post("/send-results", responseController.sendResults);
module.exports = router;
