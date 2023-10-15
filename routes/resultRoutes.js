const express = require("express");
const {
  SubmitResultForTest,
  ShowResult,
} = require("../controllers/resultControllers");
const { isLoggedIn } = require("../middleware/authMiddleware");
const router = express.Router();

//testseries/submit/test/:testId/:testseriesId/:userId/result.

router.post(
  "/testseries/submit/test/:testId/testseries/:testseriesId/user/:userId/result",
  isLoggedIn,
  SubmitResultForTest,
);

router.get(
  "/testseries/result/test/:testId/user/:userId",
  isLoggedIn,
  ShowResult,
);

module.exports = router;
