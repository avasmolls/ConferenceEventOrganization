const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Email address is not valid."] },
  name: { type: String, required: true, trim: true, minlength: [2, "Name must be at least 2 characters."], maxlength: [100, "Name must be at most 100 characters."] },
  age: { type: Number, required: true, min: [1, "Age must be at least 1."], max: [100, "Age must be at most 100."], validate: { validator: Number.isInteger, message: "Age must be a whole number." } },
  company: { type: String, required: true, trim: true, maxlength: [100, "Company must be at most 100 characters."] },
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendee", attendeeSchema);