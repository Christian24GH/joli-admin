import express from "express";
import pool from "../db.js";
import userAuthRouter from "./user-auth.js";
const router = express.Router();
// Register user-auth route for real-time account creation and email
router.use("/auth", userAuthRouter);

// Create user
router.post("/", async (req, res) => {
  const { name, email, phone, password, role, department, active, status } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO users (name, email, phone, password, role, department, active, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [name, email, phone, password, role, department, active ?? true, status ?? 'pending']
    );
    const [newRows] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);
    res.json(newRows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get user by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, password, role, department, active, status } = req.body;
  try {
    await pool.query(
      "UPDATE users SET name=?, email=?, phone=?, password=?, role=?, department=?, active=?, status=? WHERE id=?",
      [name, email, phone, password, role, department, active, status, id]
    );
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Deactivate user
router.put("/:id/deactivate", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE users SET active = false, status = 'suspended' WHERE id = ?", [id]);
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Activate user
router.put("/:id/activate", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("UPDATE users SET active = true, status = 'active' WHERE id = ?", [id]);
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

export default router;