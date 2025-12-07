const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const requireLoginKey = require("../middleware/requireLoginKey");

// Show login page if the key is valid
router.get("/", requireLoginKey, (req, res) => {
res.send("Login Page - Access Granted");
});

// Login API (no key check)
router.post("/login", authController.login);

module.exports = router;