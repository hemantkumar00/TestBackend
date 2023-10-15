module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "You need to login first!" });
  }
  next();
};

module.exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access forbidden." });
  }
  next();
};

module.exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.status(400).json({
      message: "You need to logout to create new account or to login account",
    });
  } else next();
};
