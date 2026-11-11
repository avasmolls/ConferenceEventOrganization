// server/server.js
// Setup:  npm init -y && npm install express cors mongoose dotenv
// Run:    node server.js   (listens on http://localhost:3001)
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "data", "submissions.json");
const CATEGORIES = ["Keynote", "Workshop", "Panel", "Lightning Talk", "Technology", "Other"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]");
const load = () => JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
const save = (rows) => fs.writeFileSync(DATA_FILE, JSON.stringify(rows, null, 2));

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] })); // CRA / Vite
app.use(express.json());

// List submissions (optionally ?status=pending)
app.get("/submissions", (req, res) => {
  const rows = load();
  const { status } = req.query;
  res.json(status ? rows.filter((r) => r.status === status) : rows);
});

// Create a submission (re-validate on the server; never trust the client)
app.post("/submissions", (req, res) => {
  const { title, speaker, email, category, abstract } = req.body || {};
  const errors = [];
  if (!title?.trim()) errors.push("title is required");
  if (!speaker?.trim()) errors.push("speaker is required");
  if (!EMAIL_REGEX.test(email?.trim() || "")) errors.push("valid email is required");
  if (!CATEGORIES.includes(category)) errors.push("invalid category");
  if ((abstract?.trim() || "").length < 20) errors.push("abstract must be at least 20 characters");
  if (errors.length) return res.status(400).json({ errors });

  const rows = load();
  const saved = {
    id: Date.now(),
    title: title.trim(),
    speaker: speaker.trim(),
    email: email.trim(),
    category,
    abstract: abstract.trim(),
    status: "pending",
    submittedAt: new Date().toISOString(),
  };
  rows.push(saved);
  save(rows);
  res.status(201).json(saved);
});

// Approve / reject: PATCH /submissions/:id  with body { "status": "approved" | "rejected" }
app.patch("/submissions/:id", (req, res) => {
  const { status } = req.body || {};
  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ error: "status must be approved, rejected or pending" });
  }
  const rows = load();
  const item = rows.find((r) => String(r.id) === req.params.id);
  if (!item) return res.status(404).json({ error: "Not found" });
  item.status = status;
  item.decidedAt = new Date().toISOString();
  save(rows);
  res.json(item);
});

// Serve the built React app (if you run `npm run build` in the client)
const DIST_DIR = path.join(__dirname, "..", "dist");
app.use(express.static(DIST_DIR));
// Fallback to index.html for SPA routing
app.use((req, res, next) => {
  if(req.method !== "GET") return next();
  res.sendFile(path.join(DIST_DIR, "index.html"), (err) => err && next());
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB: ", mongoose.connection.name);
    // Start the server
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB: ", err.message);
    process.exit(1);
  });