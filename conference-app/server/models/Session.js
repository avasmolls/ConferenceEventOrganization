const mongoose = require("mongoose");

// Same fields as public/sessions.json
const sessionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  unit: { type: String, default: "Ticket" },
  format: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  speaker: String,
});

module.exports = mongoose.model("Session", sessionSchema);
