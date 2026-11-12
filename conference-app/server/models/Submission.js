const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  speaker: { type: String, required: true },
  email: { type: String, required: true },
  category: { type: String, required: true },
  abstract: { type: String, required: true },
  status: { type: String, default: "pending" },
  submittedAt: { type: Date, default: Date.now },
  decidedAt: Date
});

module.exports = mongoose.model("Submission", submissionSchema);