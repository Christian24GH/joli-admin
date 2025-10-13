import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all contracts
router.get("/contracts", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        id, 
        title, 
        value, 
        due, 
        startDate, 
        type, 
        status, 
        client, 
        description, 
        priority, 
        renewalTerms, 
        paymentTerms 
      FROM contracts`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contracts." });
  }
});

// Get a single contract by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contracts WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json({ contract: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contract." });
  }
});

// Add new contract
router.post("/contracts", async (req, res) => {
  try {
    const {
      title, value, due, startDate, type, status, client,
      description, priority, renewalTerms, paymentTerms
    } = req.body;
    if (!title || !client || !value || !type || !startDate || !due || !status || !priority) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    const [result] = await pool.query(
      `INSERT INTO contracts 
        (title, value, due, startDate, type, status, client, description, priority, renewalTerms, paymentTerms) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, value, due, startDate, type, status, client, description, priority, renewalTerms, paymentTerms]
    );
    const [newContractRows] = await pool.query(
      `SELECT 
        id, 
        title, 
        value, 
        due, 
        startDate, 
        type, 
        status, 
        client, 
        description, 
        priority, 
        renewalTerms, 
        paymentTerms 
      FROM contracts WHERE id = ?`,
      [result.insertId]
    );
    res.json(newContractRows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create contract." });
  }
});

// Update contract (general)
router.put("/:id", async (req, res) => {
  try {
    const {
      title, value, due, startDate, type, status, client,
      description, priority, renewalTerms, paymentTerms
    } = req.body;
    const [result] = await pool.query(
      `UPDATE contracts SET 
        title=?, value=?, due=?, startDate=?, type=?, status=?, client=?, description=?, priority=?, renewalTerms=?, paymentTerms=?
       WHERE id=?`,
      [title, value, due, startDate, type, status, client, description, priority, renewalTerms, paymentTerms, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    const [rows] = await pool.query("SELECT * FROM contracts WHERE id = ?", [req.params.id]);
    res.json({ contract: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to update contract." });
  }
});

// Approve contract
router.put("/:id/approve", async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE contracts SET status='approved' WHERE id=?",
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    const [rows] = await pool.query("SELECT * FROM contracts WHERE id = ?", [req.params.id]);
    res.json({ contract: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve contract." });
  }
});

// Expire contract
router.put("/:id/expire", async (req, res) => {
  try {
    const [result] = await pool.query(
      "UPDATE contracts SET status='expired' WHERE id=?",
      [req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    const [rows] = await pool.query("SELECT * FROM contracts WHERE id = ?", [req.params.id]);
    res.json({ contract: rows[0] });
  } catch (err) {
    res.status(500).json({ error: "Failed to expire contract." });
  }
});

// Delete contract
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM contracts WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Contract deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contract." });
  }
});

export default router;