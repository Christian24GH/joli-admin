import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all visitors
router.get("/visitors", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM visitor_logs ORDER BY id DESC");
  res.json(rows);
});

// Create a new visitor
router.post("/visitors", async (req, res) => {
  const { passId, name, host, purpose, scheduledAt, idNumber, nda, status } = req.body;
  const [result] = await pool.query(
    "INSERT INTO visitor_logs (pass_id, name, host, purpose, scheduled_at, id_number, nda, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [passId, name, host, purpose, scheduledAt, idNumber, nda, status]
  );
  const [newRows] = await pool.query("SELECT * FROM visitor_logs WHERE id = ?", [result.insertId]);
  res.json(newRows[0]);
});

// Get a single visitor by ID
router.get("/visitors/:id", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM visitor_logs WHERE id = ?", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
});

// Update a visitor (status, check-in, check-out)
router.put("/visitors/:id", async (req, res) => {
  const { status, checkInAt, checkOutAt } = req.body;
  await pool.query(
    "UPDATE visitor_logs SET status = ?, check_in_at = ?, check_out_at = ? WHERE id = ?",
    [status, checkInAt, checkOutAt, req.params.id]
  );
  const [rows] = await pool.query("SELECT * FROM visitor_logs WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
});

// Delete a visitor
router.delete("/visitors/:id", async (req, res) => {
  await pool.query("DELETE FROM visitor_logs WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

export default router;