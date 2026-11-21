const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const Session = require("../models/Session");

// Check registration information before saving
async function checkRegistration(data) {
  if (!data.fullName || !data.email || !data.session || !data.participation) {
    return "All required fields must be filled in.";
  }
  if (typeof data.fullName !== "string" || typeof data.email !== "string") {
    return "Name and email must be text.";
  }

  const name = data.fullName.trim();
  const email = data.email.trim();
  const sessionId = Number(data.session);

  if (name.length < 2 || !/^[A-Za-z][A-Za-z\s'.-]*$/.test(name)) {
    return "Invalid full name.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Invalid email address.";
  }
  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return "Invalid session selection.";
  }
  if (!["in-person", "virtual", "vip"].includes(data.participation)) {
    return "Invalid participation type.";
  }
  if (data.notes !== undefined &&
      (typeof data.notes !== "string" || data.notes.length > 500)) {
    return "Notes must be 500 characters or fewer.";
  }

  const session = await Session.findOne({ id: sessionId });
  if (!session) return "Selected session does not exist.";
  return "";
}

// GET all registrations
router.get("/", async (req, res) => {
  try {
    res.json(await Registration.find());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET one registration
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid registration ID." });
    }
    const registration = await Registration.findOne({ id });
    if (!registration) return res.status(404).json({ error: "Registration not found." });
    res.json(registration);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create registration
router.post("/", async (req, res) => {
  try {
    const data = req.body || {};
    const error = await checkRegistration(data);
    if (error) return res.status(400).json({ error });

    const email = data.email.trim().toLowerCase();
    const session = Number(data.session);
    const duplicate = await Registration.findOne({ email, session });
    if (duplicate) {
      return res.status(409).json({ error: "Already registered for this session." });
    }

    const registration = new Registration({
      id: Date.now(),
      fullName: data.fullName.trim(),
      email,
      session,
      participation: data.participation,
      notes: data.notes ? data.notes.trim() : ""
    });
    await registration.save();
    res.status(201).json(registration);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Registration already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT update registration
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid registration ID." });
    }
    const registration = await Registration.findOne({ id });
    if (!registration) return res.status(404).json({ error: "Registration not found." });

    const data = req.body || {};
    const error = await checkRegistration(data);
    if (error) return res.status(400).json({ error });

    const email = data.email.trim().toLowerCase();
    const session = Number(data.session);
    const duplicate = await Registration.findOne({ email, session });
    if (duplicate && duplicate.id !== id) {
      return res.status(409).json({ error: "Already registered for this session." });
    }

    registration.fullName = data.fullName.trim();
    registration.email = email;
    registration.session = session;
    registration.participation = data.participation;
    registration.notes = data.notes ? data.notes.trim() : "";
    await registration.save();
    res.json(registration);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Registration already exists." });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE registration
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid registration ID." });
    }
    const registration = await Registration.findOneAndDelete({ id });
    if (!registration) return res.status(404).json({ error: "Registration not found." });
    res.json({ message: "Registration deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
