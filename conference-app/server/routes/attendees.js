const express = require("express");
const router = express.Router();
const Attendee = require("./Attendee");

// GET all attendees
router.get("/", async (req, res) => {
  try {
    const attendees = await Attendee.find();
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

module.exports = mongoose.model("Attendee", attendeeSchema);