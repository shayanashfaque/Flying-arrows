// seed.js
require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db"); // adjust path to your db config

async function createOrUpdateUser(email, password) {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Hash the password
    const hash = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM authors WHERE LOWER(email) = $1",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      // Update password if user exists
      await pool.query(
        "UPDATE authors SET password_hash = $1 WHERE LOWER(email) = $2",
        [hash, normalizedEmail]
      );
      console.log(`Password updated for ${email}`);
    } else {
      // Insert new user
      await pool.query(
        "INSERT INTO authors (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
        ["Shayana Shfaque", email, hash, "writer"]
      );
      console.log(`User created: ${email}`);
    }
  } catch (err) {
    console.error("Error creating/updating user:", err);
  } finally {
    await pool.end(); // close DB connection
    process.exit();
  }
}

// Run the script
createOrUpdateUser("Shayanashfaque@yahoo.com", "shayan123");
