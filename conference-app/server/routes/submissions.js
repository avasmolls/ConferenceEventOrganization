
const express = require("express");
const Submission = require("../models/Submission");

const router = express.Router();

const FIELDS = ["title", "speaker", "email", "category", "abstract"];
const CATEGORIES = ["Keynote", "Workshop", "Panel", "Lightning Talk", "Technology", "Other"];
const STATUSES = ["pending", "approved", "rejected"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Only keep the fields a user is allowed to set (id, status and dates stay the same)
function pickFields(body) {
  const data = {};
  for (const field of FIELDS) {
    if (body[field] !== undefined) {
      data[field] = typeof body[field] === "string" ? body[field].trim() : body[field];
    }
  }
  return data;
}

// Returns the first problem with the proposal, or null if it is valid
// isNew = true means every field has to be there
function checkSubmission(data, isNew) {
  for (const field of FIELDS) {
    const missing = data[field] === undefined || data[field] === null || data[field] === "";
    if (missing && (isNew || field in data)) {
      return isNew ? "All fields are required" : `${field} is required`;
    }
  }

  for (const field of FIELDS) {
    if (data[field] !== undefined && typeof data[field] !== "string") {
      return `${field} must be text`;
    }
  }

  if (data.email !== undefined && !EMAIL_REGEX.test(data.email)) {
    return "Invalid email";
  }

  if (data.category !== undefined && !CATEGORIES.includes(data.category)) {
    return "Invalid category";
  }

  if (data.abstract !== undefined && data.abstract.length < 20) {
    return "Abstract must be at least 20 characters";
  }

  return null;
}

// Same title from the same email counts as a duplicate proposal
// (skipId lets an edit keep its own title)
async function findDuplicate(title, email, skipId) {
  const query = { title, email };
  if (skipId !== undefined) query.id = { $ne: skipId };
  // strength 2 makes the match ignore upper/lower case
  return Submission.findOne(query).collation({ locale: "en", strength: 2 });
}

// Submission ids are numbers, so anything else can't be a real submission
function getId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: "Submission id must be a number" });
    return null;
  }
  return id;
}

// Get all submissions
router.get("/", async (req, res) => {
  try {
    if (req.query.status && !STATUSES.includes(req.query.status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

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
  const id = getId(req, res);
  if (id === null) return;

  try {
    const submission = await Submission.findOne({ id });

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
  const data = pickFields(req.body || {});
  const problem = checkSubmission(data, true);
  if (problem) return res.status(400).json({ error: problem });

  try {
    if (await findDuplicate(data.title, data.email)) {
      return res.status(409).json({
        error: "You already submitted a proposal with this title"
      });
    }

    const submission = await Submission.create({
      id: Date.now(),
      ...data,
      status: "pending",
      submittedAt: new Date()
    });

    console.log(`Created submission ${submission.id}: ${submission.title}`);
    res.status(201).json(submission);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "Submission already exists" });
    }
    res.status(400).json({ error: err.message });
  }
});

// Edit a submission
router.put("/:id", async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;

  const data = pickFields(req.body || {});
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const problem = checkSubmission(data, false);
  if (problem) return res.status(400).json({ error: problem });

  try {
    const current = await Submission.findOne({ id });
    if (!current) {
      return res.status(404).json({ error: "Submission not found" });
    }

    const title = data.title ?? current.title;
    const email = data.email ?? current.email;
    if (await findDuplicate(title, email, id)) {
      return res.status(409).json({
        error: "Another proposal with this title and email already exists"
      });
    }

    const submission = await Submission.findOneAndUpdate(
      { id },
      data,
      { returnDocument: "after", runValidators: true }
    );

    console.log(`Updated submission ${submission.id}: ${submission.title}`);
    res.json(submission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Approve or reject a submission
router.patch("/:id", async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;

  try {
    const { status } = req.body || {};

    if (!STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const submission = await Submission.findOneAndUpdate(
      { id },
      {
        status,
        decidedAt: new Date()
      },
      { returnDocument: "after", runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    console.log(`Submission ${submission.id} marked ${status}`);
    res.json(submission);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a submission
router.delete("/:id", async (req, res) => {
  const id = getId(req, res);
  if (id === null) return;

  try {
    const submission = await Submission.findOneAndDelete({ id });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    console.log(`Deleted submission ${submission.id}: ${submission.title}`);
    res.json({ message: "Submission deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
