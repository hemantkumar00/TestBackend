const express = require("express");
const {
  Checkout,
  PaymentVarification,
  ZeroPaymentCheckout,
} = require("../controllers/paymentControllers");
const { isLoggedIn } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/checkout", isLoggedIn, Checkout);

router.post(
  "/zeropaymentcheckout/:testSeriesId/:userId",
  isLoggedIn,
  ZeroPaymentCheckout,
);

router.post("/paymentverification/:testSeriesId/:userId", PaymentVarification);

module.exports = router;
