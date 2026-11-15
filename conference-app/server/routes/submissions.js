
const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

// Get all submissions
router.get("/", async (req, res) => {
  try {
    const filter = req.query.status
      ? { status: req.query.status }
      : {};

    const submissions = await Submission.find(filter);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one submission
router.get("/:id", async (req, res) => {
  try {
    const submission = await Submission.findOne({
      id: Number(req.params.id)
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Create a submission
router.post("/", async (req, res) => {
  try {
    const { title, speaker, email, category, abstract } = req.body;

    if (!title?.trim() || !speaker?.trim() ||
        !email?.trim() || !category || !abstract?.trim()) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: "Invalid email" });
    }

    if (!["Keynote", "Workshop", "Panel", "Lightning Talk",
          "Technology", "Other"].includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    if (abstract.trim().length < 20) {
      return res.status(400).json({
        error: "Abstract must be at least 20 characters"
      });
    }

    const submission = await Submission.create({
      id: Date.now(),
      title: title.trim(),
      speaker: speaker.trim(),
      email: email.trim(),
      category,
      abstract: abstract.trim(),
      status: "pending",
      submittedAt: new Date()
    });

    res.status(201).json(submission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit a submission
router.put("/:id", async (req, res) => {
  try {
    const allowed = ["title", "speaker", "email", "category", "abstract"];
    const changes = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        changes[field] = req.body[field];
      }
    }

    const submission = await Submission.findOneAndUpdate(
      { id: Number(req.params.id) },
      changes,
      { returnDocument: "after", runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Approve or reject a submission
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const submission = await Submission.findOneAndUpdate(
      { id: Number(req.params.id) },
      {
        status,
        decidedAt: new Date()
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(submission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a submission
router.delete("/:id", async (req, res) => {
  try {
    const submission = await Submission.findOneAndDelete({
      id: Number(req.params.id)
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({ message: "Submission deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
