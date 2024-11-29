const express = require("express");
const User = require("../models/user");
const router = express.Router();
const BloodDonor = require("../models/bloodDonor");

// Signup Route
router.post("/api/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password, // Plaintext password
      phone: phoneNumber,
      birthDate: dateOfBirth,
      bloodGroup,
      street,
      city,
      state,
      zipCode,
      emergencyName,
      emergencyPhone,
      isDonor, // Added field
    } = req.body;

    // Create new user
    const newUser = new User({
      name,
      email,
      password, // Save password as plaintext
      phoneNumber,
      dateOfBirth,
      bloodGroup,
      address: {
        street,
        city,
        state,
        zipCode,
      },
      emergencyContact: {
        name: emergencyName,
        phoneNumber: emergencyPhone,
      },
      isDonor,
    });

    await newUser.save();

    // If the user opts to be a blood donor
    if (isDonor) {
      const newDonor = new BloodDonor({
        userId: newUser._id,
        bloodGroup: newUser.bloodGroup,
      });
      await newDonor.save();
    }

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed." });
  }
});

// Login Route
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Attempting login for email:", email);

    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      console.log("User not found");
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Check password (no hashing, directly compare plaintext passwords)
    if (password !== user.password) {
      console.log("Password incorrect");
      return res.status(400).json({ error: "Incorrect Password" });
    }

    // If successful, respond with user information
    res.json({
      message: "Login successful",
      user: { user },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

// Fetch All Users Route
router.get("/api/users", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({});

    // Return the list of users
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

module.exports = router;
