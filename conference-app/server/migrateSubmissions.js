
require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Submission = require("./models/Submission");

async function migrateSubmissions() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Read the old JSON file
    const filePath = path.join(__dirname, "data", "submissions.json");
    const submissions = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Copy each submission into MongoDB
    let imported = 0;

    for (const submission of submissions) {
      const result = await Submission.updateOne(
        { id: submission.id },
        { $setOnInsert: submission },
        { upsert: true }
      );

      if (result.upsertedCount > 0) {
        imported++;
      }
    }

    console.log(`Imported ${imported} submissions`);
    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

migrateSubmissions();
