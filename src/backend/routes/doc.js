const express = require("express");
const Doctor = require("../models/doc");

const router = express.Router();

// Doctor Signup API
router.post("/api/doctor/signup", async (req, res) => {
  console.log(req, "from frontend");
  try {
    const {
      name,
      email,
      password, // Store plaintext password
      phoneNumber,
      birthDate,
      specialty,
      licenseNumber,
      qualifications,
      experience,
      clinicAddress,
      bloodDonor,
      emergencyName,
      emergencyPhone,
    } = req.body;

    // Create a new Doctor without hashing the password
    const newDoctor = new Doctor({
      name,
      email,
      password, // Save the password directly
      phoneNumber,
      birthDate,
      specialty,
      licenseNumber,
      qualifications,
      experience,
      clinicAddress,
      bloodDonor,
      emergencyContact: {
        name: emergencyName,
        phoneNumber: emergencyPhone,
      },
    });
    console.log(newDoctor, "newDoc");
    await newDoctor.save();

    res.status(201).json({ message: "Doctor registered successfully!" });
  } catch (error) {
    console.error("Doctor Signup Error:", error);
    res.status(500).json({ error: "Doctor signup failed." });
  }
});

// Doctor Login API
router.post("/api/doctorLogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // Compare plaintext passwords
    if (password !== doctor.password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    // If successful, respond with doctor information
    res.json({
      message: "Login successful",
      doctor: {
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
      },
    });
  } catch (error) {
    console.error("Doctor Login Error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

// Alternative Login API
router.post("/api/doctor/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found." });
    }

    // Compare plaintext passwords
    if (password !== doctor.password) {
      return res.status(400).json({ error: "Invalid email or password." });
    }

    res.status(200).json({ message: "Login successful", doctor });
  } catch (error) {
    res.status(500).json({ error: "Login failed." });
  }
});

// Get All Doctors
router.get("/api/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error retrieving doctors:", error);
    res.status(500).json({ error: "Failed to retrieve doctors." });
  }
});

module.exports = router;
