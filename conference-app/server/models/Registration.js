const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  session: { type: Number, required: true },
  participation: {
    type: String,
    required: true,
    enum: ["in-person", "virtual", "vip"]
  },
  notes: { type: String, default: "", maxlength: 500 },
  registeredAt: { type: Date, default: Date.now }
});

// Prevents duplicate registrations for the same session
registrationSchema.index({ email: 1, session: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);
