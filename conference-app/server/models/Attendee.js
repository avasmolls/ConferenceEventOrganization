const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
  company: { type: String, required: true },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendee", attendeeSchema);