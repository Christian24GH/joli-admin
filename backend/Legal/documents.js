import express from "express";
import pool from "../db.js";
const router = express.Router();

// GET /api/documents  -> list all documents
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM documents ORDER BY date DESC, id DESC");
    // convert tags from comma text to array for frontend compatibility
    const docs = rows.map(r => ({
      ...r,
      tags: r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    }));
    res.json(docs);
  } catch (err) {
    console.error("Failed to fetch documents:", err);
    res.status(500).json({ error: "Failed to fetch documents", message: err.message });
  }
});

// POST /api/documents -> create
router.post("/", async (req, res) => {
  try {
    const {
      title, type = 'Other', status = 'draft', date,
      lastModified, expiryDate = null, size = '0 KB',
      assignee = null, priority = 'medium', tags = [], starred = 0
    } = req.body;

    const tagsText = Array.isArray(tags) ? tags.join(',') : (tags || '');

    const [result] = await pool.execute(
      `INSERT INTO documents (title, type, status, date, lastModified, expiryDate, size, assignee, priority, tags, starred)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, type, status,
        date || new Date().toISOString().split('T')[0],
        lastModified || new Date().toISOString().split('T')[0],
        expiryDate || null,
        size, assignee, priority, tagsText, starred ? 1 : 0
      ]
    );

    const insertedId = result.insertId;
    const [rows] = await pool.query("SELECT * FROM documents WHERE id = ?", [insertedId]);
    const doc = rows[0];
    doc.tags = doc.tags ? doc.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    res.status(201).json(doc);
  } catch (err) {
    console.error("Failed to create document:", err);
    res.status(500).json({ error: "Failed to create document", message: err.message });
  }
});

// PUT /api/documents/:id -> update
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    // simple allowed fields
    const fields = ['title','type','status','expiryDate','size','assignee','priority','tags','starred','lastModified'];
    const set = [];
    const values = [];
    for (const f of fields) {
      if (typeof updates[f] !== 'undefined') {
        if (f === 'tags') {
          values.push(Array.isArray(updates.tags) ? updates.tags.join(',') : updates.tags);
        } else if (f === 'starred') {
          values.push(updates.starred ? 1 : 0);
        } else {
          values.push(updates[f]);
        }
        set.push(`${f} = ?`);
      }
    }
    if (set.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    values.push(id);
    await pool.execute(`UPDATE documents SET ${set.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    const [rows] = await pool.query("SELECT * FROM documents WHERE id = ?", [id]);
    const doc = rows[0];
    doc.tags = doc.tags ? doc.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    res.json(doc);
  } catch (err) {
    console.error("Failed to update document:", err);
    res.status(500).json({ error: "Failed to update document", message: err.message });
  }
});

// DELETE /api/documents/:id -> delete
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.execute("DELETE FROM documents WHERE id = ?", [id]);
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    console.error("Failed to delete document:", err);
    res.status(500).json({ error: "Failed to delete document", message: err.message });
  }
});

export default router;