const express = require("express");
const router = express.Router();
const Attendee = require("../models/Attendee");

// GET all attendees
router.get("/", async (req, res) => {
  try {
    const attendees = await Attendee.find();
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one attendee by id
router.get("/:id", async (req, res) => {
  try {
    const attendee = await Attendee.findOne({ id: req.params.id });
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found." });
    }
    res.json(attendee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST new attendee
router.post("/", async (req, res) => {
  try {
    const { email, name, age, company } = req.body;
    if (!email || !name || !age || !company) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const newAttendee = new Attendee({
      id: Date.now(),
      email,
      name,
      age,
      company
    });

    const savedAttendee = await newAttendee.save();
    res.status(201).json(savedAttendee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update attendee
router.put("/:id", async (req, res) => {
  try {
    const { email, name, age, company } = req.body;

    const updatedAttendee = await Attendee.findOneAndUpdate(
      { id: req.params.id },
      { email, name, age, company },
      { new: true, runValidators: true }
    );

    if (!updatedAttendee) {
      return res.status(404).json({ error: "Attendee not found." });
    }
    res.json(updatedAttendee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "An attendee with that email already exists." });
    }
    res.status(400).json({ error: err.message });
  }
});

// DELETE attendee
router.delete("/:id", async (req, res) => {
  try {
    const deletedAttendee = await Attendee.findOneAndDelete({ id: req.params.id });

    if (!deletedAttendee) {
      return res.status(404).json({ error: "Attendee not found." });
    }
    res.json({ message: "Attendee deleted.", attendee: deletedAttendee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;