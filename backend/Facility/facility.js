import express from "express";
import pool from "../db.js";
const router = express.Router();

// Get all facilities
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM facilities");
  res.json(rows);
});

// Add a facility
router.post("/", async (req, res) => {
  const { id, type, name, capacity, amenities, price, photos, description } = req.body;
  await pool.query(
    "INSERT INTO facilities (id, type, name, capacity, amenities, price, photos, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, type, name, capacity, amenities, price, photos, description]
  );
  res.json({ success: true });
});

export default router;