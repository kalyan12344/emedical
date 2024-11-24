const express = require("express");
const IssueThread = require("../models/issue");
const router = express.Router();

// Create a new issue thread
router.post("/api/issues", async (req, res) => {
  try {
    const { user, email, message } = req.body;

    if (!user || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const issueThread = new IssueThread({
      user,
      email,
      messages: [{ sender: "user", message }],
    });

    await issueThread.save();
    res
      .status(201)
      .json({ message: "Issue thread created successfully", issueThread });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// Add a message to an issue thread
// router.post("/api/issues/:id/messages", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { sender, message } = req.body;

//     const issueThread = await IssueThread.findById(id);
//     if (!issueThread) {
//       return res.status(404).json({ error: "Issue thread not found" });
//     }

//     issueThread.messages.push({ sender, message });
//     issueThread.updatedAt = Date.now();

//     await issueThread.save();
//     res
//       .status(200)
//       .json({ message: "Message added successfully", issueThread });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// Get all issue threads
router.get("/api/issues", async (req, res) => {
  try {
    const issues = await IssueThread.find().populate("user", "name email");
    res.status(200).json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single issue thread
router.get("/api/issues/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const issueThread = await IssueThread.findById(id).populate(
      "user",
      "name email"
    );

    if (!issueThread) {
      return res.status(404).json({ error: "Issue thread not found" });
    }

    res.status(200).json(issueThread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issues by user ID
router.get("/api/issues/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find issues related to the specific user
    const issues = await IssueThread.find({ user: userId }).populate(
      "user",
      "name email"
    );

    if (!issues || issues.length === 0) {
      return res.status(404).json({ error: "No issues found for this user" });
    }

    res.status(200).json(issues);
  } catch (error) {
    console.error("Error fetching issues by user ID:", error.message);
    res.status(500).json({ error: error.message });
  }
});
router.patch("/api/issues/user/:userId/mark-read", async (req, res) => {
  const { userId } = req.params;
  console.log("userId", userId);

  try {
    const issue = await IssueThread.findOne({ user: userId }); // Find the issue by user ID
    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issue.messages.forEach((message) => {
      if (message.sender === "user") {
        message.isRead = true; // Mark all user messages as read
      }
    });

    issue.updatedAt = new Date();
    await issue.save();

    res.status(200).json({ message: "Messages marked as read", issue });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// Update the status of an issue thread
router.patch("/api/issues/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const issueThread = await IssueThread.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!issueThread) {
      return res.status(404).json({ error: "Issue thread not found" });
    }

    res
      .status(200)
      .json({ message: "Status updated successfully", issueThread });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/api/issues/:userId/messages", async (req, res) => {
  const { userId } = req.params;
  const { sender, message } = req.body;
  console.log("Incoming request:", { userId, sender, message });

  try {
    if (!message || !sender) {
      return res
        .status(400)
        .json({ error: "Sender and message are required." });
    }

    // Find the issue thread for the user
    const issueThread = await IssueThread.findOne({ user: userId });

    if (!issueThread) {
      return res
        .status(404)
        .json({ error: "Issue thread not found for the user." });
    }

    // Add the new reply message
    issueThread.messages.push({ sender, message, timestamp: new Date() });
    issueThread.updatedAt = new Date();

    await issueThread.save();

    res.status(200).json({
      message: "Reply added successfully.",
      updatedIssueThread: issueThread,
    });
  } catch (error) {
    console.error("Error adding reply to issue thread:", error);
    res.status(500).json({ error: "Failed to add reply to issue thread." });
  }
});

module.exports = router;
