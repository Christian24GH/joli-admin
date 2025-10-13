import express from "express";
import pool from "../db.js";
const router = express.Router();

// Get all reservations
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM facility_reservations ORDER BY start DESC");
  res.json(rows);
});

// Add a reservation
router.post("/", async (req, res) => {
  const { facility_id, start, end, group_name, customer, purpose, price, payment, payment_status, status } = req.body;
  const [result] = await pool.query(
    "INSERT INTO facility_reservations (facility_id, start, end, group_name, customer, purpose, price, payment, payment_status, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [facility_id, start, end, group_name, customer, purpose, price, payment, payment_status, status]
  );
  const [newRows] = await pool.query("SELECT * FROM facility_reservations WHERE id = ?", [result.insertId]);
  res.json(newRows[0]);
});

// Approve a reservation
router.put("/:id/approve", async (req, res) => {
  await pool.query("UPDATE facility_reservations SET status = 'approved' WHERE id = ?", [req.params.id]);
  const [rows] = await pool.query("SELECT * FROM facility_reservations WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
});

// Cancel a reservation
router.put("/:id/cancel", async (req, res) => {
  await pool.query("UPDATE facility_reservations SET status = 'cancelled' WHERE id = ?", [req.params.id]);
  const [rows] = await pool.query("SELECT * FROM facility_reservations WHERE id = ?", [req.params.id]);
  res.json(rows[0]);
});

// Update payment status
router.put('/:id/payment-status', async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, payment_status } = req.body;
  const status = paymentStatus || payment_status;
  if (!status) {
    return res.status(400).json({ error: 'Missing payment status' });
  }
  try {
    await pool.query('UPDATE facility_reservations SET payment_status = ? WHERE id = ?', [status, id]);
    const [rows] = await pool.query('SELECT * FROM facility_reservations WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Generate reservation receipt (plain text for now)
router.get('/:id/receipt', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM facility_reservations WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
  const r = rows[0];
  res.setHeader('Content-Type', 'text/plain');
  res.send(`Reservation Receipt\nReservation ID: ${r.id}\nFacility: ${r.facility_id}\nCustomer/Group: ${r.group_name || r.customer}\nStart: ${r.start}\nEnd: ${r.end}\nPurpose: ${r.purpose}\nPrice: $${r.price}\nPayment Status: ${r.payment_status}`);
});

// Generate e-voucher/booking confirmation
router.get('/:id/evoucher', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM facility_reservations WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
  const r = rows[0];
  res.setHeader('Content-Type', 'text/plain');
  res.send(`E-Voucher / Booking Confirmation\nReservation ID: ${r.id}\nFacility: ${r.facility_id}\nCustomer/Group: ${r.group_name || r.customer}\nStart: ${r.start}\nEnd: ${r.end}\nPurpose: ${r.purpose}\nStatus: ${r.status}\nUnique Code: EV-${r.id}-${r.facility_id}`);
});

// Generate travel documents (tickets, passes, permits)
router.get('/:id/travel-docs', async (req, res) => {
  const { id } = req.params;
  const [rows] = await pool.query('SELECT * FROM facility_reservations WHERE id = ?', [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Reservation not found' });
  const r = rows[0];
  res.setHeader('Content-Type', 'text/plain');
  res.send(`Travel Documents\nReservation ID: ${r.id}\nFacility: ${r.facility_id}\nCustomer/Group: ${r.group_name || r.customer}\nStart: ${r.start}\nEnd: ${r.end}\nPurpose: ${r.purpose}\nTickets/Passes: ${r.tickets || 'N/A'}\nPermits: ${r.permits || 'N/A'}`);
});

export default router;