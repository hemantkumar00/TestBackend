require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const Razorpay = require("razorpay");

const app = express();

mongoose
  .connect(
    // "mongodb://127.0.0.1:27017/NursingApp2" ||
    "mongodb+srv://hemant:12345678%40Qaz@cluster0.eeycxwc.mongodb.net/nursing?retryWrites=true&w=majority",
  )
  .then(() => {
    console.log("DB connected...");
  })
  .catch((err) => {
    console.log(err);
  });

// Set up session configuration
const sessionConfig = {
  secret: "hellohemant",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 * 100,
  },
};

//Configure Razorpay
module.exports.instance = new Razorpay({
  key_id: "rzp_test_NKFpEzB6fac5qX",
  key_secret: "EC5qatXC58cAUdesgcUAPhHt",
});

// Configure passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(
  cors({
    origin: [
      "http://ec2-52-66-120-181.ap-south-1.compute.amazonaws.com",
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser("hellohemant"));

// Handle routes
const authRoutes = require("./routes/authRoutes");
const testSeriesRouters = require("./routes/testSeriesRoutes");
const testRoutes = require("./routes/testRoutes");
const questionRoutes = require("./routes/questionRoutes");
const resultRoutes = require("./routes/resultRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminUserRoutes = require("./routes/adminUserRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/uploads", express.static("uploads"));

app.use(authRoutes);
app.use(testSeriesRouters);
app.use(testRoutes);
app.use(questionRoutes);
app.use(resultRoutes);
app.use(paymentRoutes);
app.use(adminUserRoutes);
app.use(feedbackRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server connect at port ${port}`);
});
