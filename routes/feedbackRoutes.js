const express = require("express");
const {
  AddFeedback,
  GetAllFeedBack,
  GetAllActiveFeedBack,
  ToggleActivation,
} = require("../controllers/feedbackControllers");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const router = express.Router();

// Define your route and attach the validation middleware
router.post("/add/feedback", AddFeedback);
router.get("/all/feedback/admin", isLoggedIn, isAdmin, GetAllFeedBack);
router.get(
  "/all/feedback/active/admin",
  isLoggedIn,
  isAdmin,
  GetAllActiveFeedBack,
);
router.get(
  "/feedback/activation/:feedbackId/admin",
  isLoggedIn,
  isAdmin,
  ToggleActivation,
);

module.exports = router;
