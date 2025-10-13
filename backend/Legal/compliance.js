import express from "express";
import pool from "../db.js";

const router = express.Router();

// GET /compliance/
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM compliance ORDER BY id DESC");
    return res.json({ compliance: rows });
  } catch (err) {
    console.error("GET /compliance error:", err);
    return res.status(500).json({ error: "Failed to fetch compliance items.", message: err.message });
  }
});

// POST /compliance/
router.post("/", async (req, res) => {
  try {
    const {
      title, due = null, description = null, category = "General", status = "pending",
      priority = "medium", riskLevel = "medium", assignee = null, department = null,
      framework = null, evidence = null, nextReview = null, starred = 0, progress = 0
    } = req.body;

    if (!title) return res.status(400).json({ error: "Missing required field: title" });

    const [result] = await pool.execute(
      `INSERT INTO compliance
       (title, due, description, category, status, priority, riskLevel, assignee, department, framework, evidence, nextReview, starred, progress)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, due, description, category, status, priority, riskLevel, assignee, department, framework, evidence, nextReview, starred ? 1 : 0, progress || 0]
    );

    const [rows] = await pool.query("SELECT * FROM compliance WHERE id = ?", [result.insertId]);
    return res.status(201).json({ compliance: rows[0] });
  } catch (err) {
    console.error("POST /compliance error:", err);
    return res.status(500).json({ error: "Failed to add compliance item.", message: err.message });
  }
});

// PUT /compliance/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    const allowed = ['title','due','description','category','status','priority','riskLevel','assignee','department','framework','evidence','nextReview','starred','progress'];

    const set = [];
    const vals = [];
    for (const k of allowed) {
      if (typeof updates[k] !== 'undefined') {
        set.push(`${k} = ?`);
        vals.push(k === 'starred' ? (updates[k] ? 1 : 0) : updates[k]);
      }
    }
    if (!set.length) return res.status(400).json({ error: 'No valid fields to update' });

    vals.push(id);
    await pool.execute(`UPDATE compliance SET ${set.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, vals);
    const [rows] = await pool.query("SELECT * FROM compliance WHERE id = ?", [id]);
    return res.json({ compliance: rows[0] });
  } catch (err) {
    console.error("PUT /compliance/:id error:", err);
    return res.status(500).json({ error: "Failed to update compliance item.", message: err.message });
  }
});

// DELETE /compliance/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.execute("DELETE FROM compliance WHERE id = ?", [id]);
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /compliance/:id error:", err);
    return res.status(500).json({ error: "Failed to delete compliance item.", message: err.message });
  }
});

export default router;