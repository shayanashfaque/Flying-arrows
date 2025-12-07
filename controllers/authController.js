const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    console.log("Login route key param:", req.params.key);

    const { email, password } = req.body;
   

   
    if (!email || !password) {
      console.log("Missing email or password in request");
      return res.status(400).json({ message: "Email and password are required" });
    }

    
    const normalizedEmail = email.toLowerCase().trim();
    console.log("Normalized email:", normalizedEmail);

    
    const query = `
      SELECT id, name, bio, profile_image, email, password_hash, role
      FROM authors
      WHERE LOWER(email) = $1
      LIMIT 1;
    `;
    const result = await pool.query(query, [normalizedEmail]);
    console.log("DB query result:", result.rows);

    if (result.rows.length === 0) {
      console.log("No user found with this email");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const author = result.rows[0];
    console.log("Fetched author:", author);

   
    if (!["writer", "editor"].includes(author.role)) {
      console.log("User role not authorized:", author.role);
      return res.status(403).json({ message: "Unauthorized role" });
    }

   
    const match = await bcrypt.compare(password, author.password_hash);
    console.log("Password match result:", match);
    if (!match) {
      console.log("Password does not match");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    
    const token = jwt.sign(
      { id: author.id, role: author.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } // Default to 1h if not set
    );
    console.log("Generated JWT token for user:", author.id);

   
    res.json({
      message: "Login successful",
      token,
      author: {
        id: author.id,
        name: author.name,
        bio: author.bio,
        profile_image: author.profile_image,
        role: author.role,
        email: author.email,
      },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};