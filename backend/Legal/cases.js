import express from "express";
import pool from "../db.js";

const router = express.Router();

// Get all cases
router.get("/cases", async (req, res) => {
  const [rows] = await pool.query("SELECT id, title, case_type AS caseType, due, status FROM admin_cases");
  res.json(rows);
});

// Add a new case
router.post("/cases", async (req, res) => {
  // Accept caseType from frontend, map to case_type for DB
  const { caseType, title, due, status } = req.body;
  const [result] = await pool.query(
    "INSERT INTO admin_cases (case_type, title, due, status) VALUES (?, ?, ?, ?)",
    [caseType, title, due, status]
  );
  const [newCaseRows] = await pool.query("SELECT id, title, case_type AS caseType, due, status FROM admin_cases WHERE id = ?", [result.insertId]);
  res.json(newCaseRows[0]);
});

export default router;