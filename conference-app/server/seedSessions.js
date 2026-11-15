// Adds the sessions from public/sessions.json to MongoDB
// Run: node seedSessions.js
require("dotenv").config();
const mongoose = require("mongoose");
const Session = require("./models/Session");
const sessions = require("../public/sessions.json");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    for (const session of sessions) {
      // upsert so running it again doesn't make duplicates
      await Session.updateOne({ id: session.id }, session, { upsert: true });
    }
    console.log(`Seeded ${sessions.length} sessions`);
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Seeding failed: ", err.message);
    process.exit(1);
  });
