import express from "express";
import nodemailer from "nodemailer";
import pool from "../db.js"; // or your DB connection

const router = express.Router();

function generatePassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pass = "";
  for (let i = 0; i < length; i++) pass += chars[Math.floor(Math.random() * chars.length)];
  return pass;
}

// Configure nodemailer for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

router.post("/register", async (req, res) => {
  const { name, email, phone, role, department } = req.body;
  const password = generatePassword();

  try {
    // Save user to database
    await pool.query(
      "INSERT INTO users (name, email, phone, password, role, department, active, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone, password, role, department, true, "pending"]
    );

    // Send email with credentials
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your Account Credentials",
      text: `Hello ${name},\n\nYour account has been created.\nLogin email: ${email}\nPassword: ${password}\n\nPlease change your password after logging in.`,
    });

    console.log("Email sent:", info.response); // <-- This should log if email is sent
    res.json({ success: true, message: "User created and email sent." });
  } catch (err) {
    console.error("Email error:", err, err.response);
    res.status(500).json({ error: "Database or email error", details: err.message });
  }
});

export default router;
