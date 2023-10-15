const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const {
  GetSingleTest,
  CreateQuestionWithImage,
  UpdateQuestionWithImage,
  DeleteSingleQuestion,
  AddMultipleQuestions,
} = require("../controllers/questionControllers");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const upload = multer({ dest: "uploads/" });
const path = require("path"); // Add this line to import the 'path' module

cloudinary.config({
  cloud_name: "dunn1w6jk",
  api_key: "859313889433411",
  api_secret: "jXQN25JKopkK7_uRLkS677o6PV4",
});

const { body, param } = require("express-validator");

// Validation middleware for CreateQuestionWithImage
const validateCreateQuestionWithImage = [
  param("testId").notEmpty().withMessage("Test ID is required"),
  body("name").notEmpty().withMessage("Name is required"),
  // body("desc").notEmpty().withMessage("Description is required"),
  body("options")
    .notEmpty()
    .withMessage("Options are required")
    .custom((value) => value.split(",").length >= 2)
    .withMessage("At least two options are required"),
  body("correctOpt")
    .notEmpty()
    .withMessage("Correct options are required")
    .custom((value) => value.split(",").length >= 1)
    .withMessage("At least one correct option is required"),
  // Add more validation rules as needed for other fields
];

// Get the complete test
// TODO: Have to create a middleware for admin and user to access the test based on purchase of user.
router.get("/testseries/:testId/view", isLoggedIn, GetSingleTest);

// Create questions
router.post(
  "/testseries/:testId/new/question",
  upload.single("image"),
  validateCreateQuestionWithImage,
  isLoggedIn,
  isAdmin,
  CreateQuestionWithImage,
);

// Update questions.
router.patch(
  "/testseries/:questionId/update/question",
  upload.single("image"),
  isLoggedIn,
  isAdmin,
  UpdateQuestionWithImage,
);

//Delete Question
router.delete(
  "/testseries/:testId/:questionId/delete/question",
  isLoggedIn,
  isAdmin,
  DeleteSingleQuestion,
);

//Add multiple through Excel
router.post(
  "/testseries/:testId/add/multiple/questions",
  upload.single("file"),
  isLoggedIn,
  isAdmin,
  AddMultipleQuestions,
);

router.get(
  "/test-series/download-template",
  isLoggedIn,
  isAdmin,
  (req, res) => {
    const filePath = path.join(__dirname, "downloads/template.xlsx");
    res.download(filePath, "template.xlsx", (err) => {
      if (err) {
        console.error("Error while downloading template:", err);
        res.status(500).send("Error while downloading the template");
      }
    });
  },
);

module.exports = router;
