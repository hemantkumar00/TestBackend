const express = require("express");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const {
  GetAllUsers,
  DeleteTestSeriesFromUser,
  AddTestSeriesToUser,
  GetAllPayment,
  GetSinglePaymentAmount,
  AdminUserToggle,
} = require("../controllers/adminUserControllers");
const router = express.Router();

//Get All User

router.get("/all/users", isLoggedIn, isAdmin, GetAllUsers);
router.delete(
  "/admin/delete/testseries/:userId/:testSeriesId",
  isLoggedIn,
  isAdmin,
  DeleteTestSeriesFromUser,
);

router.post(
  "/admin/add/testseries/:userId/:testSeriesId",
  isLoggedIn,
  isAdmin,
  AddTestSeriesToUser,
);

router.get("/admin/get/payments", isLoggedIn, isAdmin, GetAllPayment);

router.post(
  "/admin/get/single/payment",
  isLoggedIn,
  isAdmin,
  GetSinglePaymentAmount,
);

// Admin/User Toggle.

router.put("/admin/update/role/:userId", isLoggedIn, isAdmin, AdminUserToggle);

module.exports = router;
