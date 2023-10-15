const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const {
  CreateTestSeries,
  GetAllTestSeries,
  UpdateTestSeries,
  DeleteTestSeries,
  ToggleActivationTestSeries,
  GetAllTestSeriesOfUser,
  ActivateHomePageHeaderTestSeries,
  GetActivatedHomePageTestSeries,
} = require("../controllers/testSeriesControllers");
const { isAdmin, isLoggedIn } = require("../middleware/authMiddleware");
const cloudinary = require("cloudinary").v2;
const upload = multer({ dest: "uploads/" });
const router = express.Router();

cloudinary.config({
  cloud_name: "dunn1w6jk",
  api_key: "859313889433411",
  api_secret: "jXQN25JKopkK7_uRLkS677o6PV4",
});

router.post(
  "/testseries/new",
  isLoggedIn,
  isAdmin,
  upload.single("image"),
  [
    body("topic").notEmpty().withMessage("topic is required."),
    body("description").notEmpty().withMessage("Description is required."),
  ],

  CreateTestSeries,
);

//Fetch all testSeries.

router.get("/all/testseries", GetAllTestSeries);

//Update test Series

router.patch(
  "/testseries/update/:testseriesId",
  isLoggedIn,
  isAdmin,
  upload.single("image"),
  UpdateTestSeries,
);

router.delete(
  "/testseries/delete/:testseriesId",
  isLoggedIn,
  isAdmin,
  DeleteTestSeries,
);

router.patch(
  "/testseries/toggle/activation/:testseriesId",
  isLoggedIn,
  isAdmin,
  ToggleActivationTestSeries,
);

router.get("/all/users/testseries/:userId", isLoggedIn, GetAllTestSeriesOfUser);

//show header test-series of the home page.

router.patch(
  "/testseries/active/homepage/:testseriesId",
  isLoggedIn,
  isAdmin,
  ActivateHomePageHeaderTestSeries,
);

//Getting the activated test series for the home page.

router.get(
  "/testseries/get/activated/homepage",
  GetActivatedHomePageTestSeries,
);

module.exports = router;
