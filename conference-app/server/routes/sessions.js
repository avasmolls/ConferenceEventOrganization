const express = require("express");
const Session = require("../models/Session");

const router = express.Router();

const FIELDS = ["title", "description", "category", "unit", "format", "price", "speaker"];
const REQUIRED = ["title", "category", "format", "price"];

// Only keep the fields a session is allowed to have (so id and _id can't be changed)
function pickFields(body) {
  const data = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) {
      data[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  }
  return data;
}

// Returns a list of problems with the session data (empty list means it is valid)
// isNew = true checks that every required field is there
function checkSession(data, isNew) {
  const errors = [];

  for (const field of REQUIRED) {
    const missing = data[field] === undefined || data[field] === null || data[field] === "";
    if (missing && (isNew || field in data)) {
      errors.push(`${field} is required`);
    }
  }

  if (data.price !== undefined && data.price !== null && data.price !== "") {
    if (typeof data.price !== "number" || Number.isNaN(data.price)) {
      errors.push("price must be a number");
    } else if (data.price < 0) {
      errors.push("price must be 0 or more");
    }
  }

  return errors;
}

// Session ids are numbers, so anything else can't be a real session
function getId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Session id must be a number" });
    return null;
  }
  return id;
}

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
  const id = getId(req, res);
  if (id === null) return;

  try {
    const session = await Session.findOne({ id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a session
router.post("/", async (req, res) => {
  const data = pickFields(req.body || {});
  const errors = checkSession(data, true);
  if (errors.length) return res.status(400).json({ error: errors.join(", "), errors });

  // The client can pick an id, otherwise we make one
  let id = Date.now();
  if (req.body.id !== undefined) {
    id = Number(req.body.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Session id must be a number" });
    }
  }

  try {
    const existing = await Session.findOne({ id });
    if (existing) {
      return res.status(409).json({ error: `A session with id ${id} already exists` });
    }

    const session = await Session.create({ id, ...data });
    console.log(`Created session ${session.id}: ${session.title}`);
    res.status(201).json(session);
  } catch (err) {
    // 11000 is MongoDB's duplicate key error (two requests at the same time)
    if (err.code === 11000) {
      return res.status(409).json({ error: `A session with id ${id} already exists` });
    }
    res.status(400).json({ error: err.message });
  }
});

// Update a session
router.put("/:id", async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;

  const body = req.body || {};
  if (body.id !== undefined && Number(body.id) !== id) {
    return res.status(400).json({ error: "Session id can't be changed" });
  }

  const data = pickFields(body);
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const errors = checkSession(data, false);
  if (errors.length) return res.status(400).json({ error: errors.join(", "), errors });

  try {
    const session = await Session.findOneAndUpdate({ id }, data, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!session) return res.status(404).json({ error: "Session not found" });
    console.log(`Updated session ${session.id}: ${session.title}`);
    res.json(session);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a session
router.delete("/:id", async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;

  try {
    const session = await Session.findOneAndDelete({ id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    console.log(`Deleted session ${session.id}: ${session.title}`);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
