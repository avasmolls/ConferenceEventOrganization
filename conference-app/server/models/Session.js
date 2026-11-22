const mongoose = require("mongoose");

// Same fields as public/sessions.json
const sessionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: [true, "title is required"], trim: true },
  description: { type: String, trim: true },
  category: { type: String, required: [true, "category is required"], trim: true },
  unit: { type: String, default: "Ticket", trim: true },
  format: { type: String, required: [true, "format is required"], trim: true },
  price: {
    type: Number,
    required: [true, "price is required"],
    min: [0, "price must be 0 or more"],
  },
  speaker: { type: String, trim: true },
});

module.exports = mongoose.model("Session", sessionSchema);
