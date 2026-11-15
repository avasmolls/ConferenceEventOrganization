const express = require("express");
const Session = require("../models/Session");

const router = express.Router();

// Get all sessions
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find().sort({ id: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one session by id
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findOne({ id: req.params.id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a session
router.post("/", async (req, res) => {
  try {
    const session = await Session.create(req.body);
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a session
router.put("/:id", async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate({ id: req.params.id }, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a session
router.delete("/:id", async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({ id: req.params.id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
