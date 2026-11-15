const express = require("express");
const Attendee = require("../models/Attendee");

const router = express.Router();

// Get all attendees
router.get("/", async (req, res) => {
  try {
    const attendees = await Attendee.find().sort({ id: 1 });
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one attendee by id
router.get("/:id", async (req, res) => {
  try {
    const attendee = await Attendee.findOne({ id: req.params.id });
    if (!attendee) return res.status(404).json({ error: "Attendee not found" });
    res.json(attendee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add an attendee (server assigns the next id)
router.post("/", async (req, res) => {
  try {
    const last = await Attendee.findOne().sort({ id: -1 });
    const nextId = last ? last.id + 1 : 1;
    const { email, name, age, company } = req.body;
    const attendee = await Attendee.create({ id: nextId, email, name, age, company });
    res.status(201).json(attendee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "An attendee with that email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update an attendee
router.put("/:id", async (req, res) => {
  try {
    const { email, name, age, company } = req.body;
    const attendee = await Attendee.findOneAndUpdate(
      { id: req.params.id },
      { email, name, age, company },
      { returnDocument: "after", runValidators: true }
    );
    if (!attendee) return res.status(404).json({ error: "Attendee not found" });
    res.json(attendee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "An attendee with that email already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Delete an attendee
router.delete("/:id", async (req, res) => {
  try {
    const attendee = await Attendee.findOneAndDelete({ id: req.params.id });
    if (!attendee) return res.status(404).json({ error: "Attendee not found" });
    res.json(attendee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;