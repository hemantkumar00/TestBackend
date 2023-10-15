const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const {
  GetAllTest,
  CreateTest,
  UpdateTest,
  DeleteSingleTest,
  GetSingleTestInstruction,
} = require("../controllers/testControllers");
const router = express.Router();

// Get All tests from selected testseries

router.get("/testseries/:testSeriesId/all", GetAllTest);

router.post(
  "/testseries/:testSeriesId/newtest",
  isLoggedIn,
  isAdmin,
  CreateTest,
);

router.patch("/testseries/:testId/update", isLoggedIn, isAdmin, UpdateTest);

router.delete(
  "/testseries/:testSeriesId/:testId/delete",
  isLoggedIn,
  isAdmin,
  DeleteSingleTest,
);

module.exports = router;
