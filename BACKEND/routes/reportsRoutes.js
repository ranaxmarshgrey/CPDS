// backend/routes/reportsRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * Helper: parse optional date filters (?start=YYYY-MM-DD&end=YYYY-MM-DD)
 */
function dateClause(column, req, params) {
  const { start, end } = req.query;
  if (start && end) { params.push(start, end); return ` AND ${column} BETWEEN ? AND ? `; }
  if (start)       { params.push(start);       return ` AND ${column} >= ? `; }
  if (end)         { params.push(end);         return ` AND ${column} <= ? `; }
  return '';
}

/* 1) Customers who SENT more than N parcels (default N=5)
   GET /api/reports/top-senders?n=5&start=2025-01-01&end=2025-12-31
*/
router.get('/top-senders', (req, res) => {
  const n = Number(req.query.n || 5);
  const params = [];
  const whereDates = dateClause('p.booking_date', req, params);

  const sql = `
    SELECT c.customer_id, c.name, c.phone, c.email,
           COUNT(*) AS sent_count,
           MIN(p.booking_date) AS first_booking,
           MAX(p.booking_date) AS last_booking
    FROM parcel p
    JOIN customer c ON c.customer_id = p.sender_id
    WHERE 1=1 ${whereDates}
    GROUP BY c.customer_id, c.name, c.phone, c.email
    HAVING sent_count > ?
    ORDER BY sent_count DESC, last_booking DESC
    LIMIT 100;
  `;
  params.push(n);
  db.query(sql, params, (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 2) Customers who RECEIVED more than N parcels
   GET /api/reports/top-receivers?n=5
*/
router.get('/top-receivers', (req, res) => {
  const n = Number(req.query.n || 5);
  const params = [];
  const whereDates = dateClause('p.booking_date', req, params);

  const sql = `
    SELECT c.customer_id, c.name, c.phone, c.email,
           COUNT(*) AS recv_count,
           MIN(p.booking_date) AS first_received,
           MAX(p.booking_date) AS last_received
    FROM parcel p
    JOIN customer c ON c.customer_id = p.receiver_id
    WHERE 1=1 ${whereDates}
    GROUP BY c.customer_id, c.name, c.phone, c.email
    HAVING recv_count > ?
    ORDER BY recv_count DESC, last_received DESC
    LIMIT 100;
  `;
  params.push(n);
  db.query(sql, params, (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 3) Parcels by status (Booked / In Transit / Delivered / Returned)
   GET /api/reports/parcels-by-status
*/
router.get('/parcels-by-status', (req, res) => {
  const params = [];
  const whereDates = dateClause('booking_date', req, params);
  const sql = `
    SELECT status, COUNT(*) AS count
    FROM parcel
    WHERE 1=1 ${whereDates}
    GROUP BY status
    ORDER BY count DESC;
  `;
  db.query(sql, params, (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 4) Recent parcel bookings (latest 10)
   GET /api/reports/recent-parcels?limit=10
*/
router.get('/recent-parcels', (req, res) => {
  const limit = Math.min(Number(req.query.limit || 10), 100);
  const sql = `
    SELECT parcel_id, type, weight_kg, status, booking_date, sender_id, receiver_id
    FROM parcel
    ORDER BY booking_date DESC
    LIMIT ?
  `;
  db.query(sql, [limit], (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 5) Deliveries per agent (totals + delivered + active)
   GET /api/reports/agent-performance
*/
router.get('/agent-performance', (req, res) => {
  const params = [];
  const whereDates = dateClause('d.dispatch_date', req, params);
  const sql = `
    SELECT da.agent_id, da.name,
           COUNT(d.delivery_id) AS total_deliveries,
           SUM(d.status = 'Delivered') AS delivered,
           SUM(d.status IN ('Dispatched','Out for Delivery')) AS active
    FROM delivery d
    JOIN delivery_agent da ON da.agent_id = d.agent_id
    WHERE 1=1 ${whereDates}
    GROUP BY da.agent_id, da.name
    ORDER BY total_deliveries DESC, delivered DESC;
  `;
  db.query(sql, params, (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 6) Live deliveries table (latest 20 by dispatch_date)
   GET /api/reports/live-deliveries?limit=20
*/
router.get('/live-deliveries', (req, res) => {
  const limit = Math.min(Number(req.query.limit || 20), 200);
  const sql = `
    SELECT d.delivery_id, d.parcel_id, d.agent_id, d.vehicle_id,
           d.dispatch_date, d.delivery_date, d.status
    FROM delivery d
    ORDER BY COALESCE(d.delivery_date, d.dispatch_date) DESC
    LIMIT ?
  `;
  db.query(sql, [limit], (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 7) Customer’s full parcel history (sent + received)
   GET /api/reports/customer-history/:customer_id
*/
router.get('/customer-history/:customer_id', (req, res) => {
  const { customer_id } = req.params;
  const sql = `
    SELECT 'SENT' AS role, p.parcel_id, p.type, p.weight_kg, p.status, p.booking_date, p.receiver_id AS other_party
    FROM parcel p WHERE p.sender_id = ?
    UNION ALL
    SELECT 'RECEIVED' AS role, p.parcel_id, p.type, p.weight_kg, p.status, p.booking_date, p.sender_id AS other_party
    FROM parcel p WHERE p.receiver_id = ?
    ORDER BY booking_date DESC
    LIMIT 200;
  `;
  db.query(sql, [customer_id, customer_id], (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 8) Parcel → delivery snapshot (join)
   GET /api/reports/parcel-delivery/:parcel_id
*/
router.get('/parcel-delivery/:parcel_id', (req, res) => {
  const { parcel_id } = req.params;
  const sql = `
    SELECT p.parcel_id, p.type, p.weight_kg, p.status AS parcel_status, p.booking_date,
           d.delivery_id, d.agent_id, d.vehicle_id, d.dispatch_date, d.delivery_date, d.status AS delivery_status
    FROM parcel p
    LEFT JOIN delivery d ON d.parcel_id = p.parcel_id
    WHERE p.parcel_id = ?
    LIMIT 1;
  `;
  db.query(sql, [parcel_id], (err, rows) => err ? res.status(500).json(err) : res.json(rows[0] || null));
});

/* 9) Top pairs: sender → receiver frequency
   GET /api/reports/top-sender-receiver?limit=10
*/
router.get('/top-sender-receiver', (req, res) => {
  const limit = Math.min(Number(req.query.limit || 10), 100);
  const params = [];
  const whereDates = dateClause('p.booking_date', req, params);
  const sql = `
    SELECT s.customer_id AS sender_id, s.name AS sender_name,
           r.customer_id AS receiver_id, r.name AS receiver_name,
           COUNT(*) AS parcels
    FROM parcel p
    JOIN customer s ON s.customer_id = p.sender_id
    JOIN customer r ON r.customer_id = p.receiver_id
    WHERE 1=1 ${whereDates}
    GROUP BY sender_id, sender_name, receiver_id, receiver_name
    ORDER BY parcels DESC
    LIMIT ?
  `;
  params.push(limit);
  db.query(sql, params, (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

/* 10) Parcels heavier than X kg (default 10kg), by status
   GET /api/reports/heavy-parcels?min=10
*/
router.get('/heavy-parcels', (req, res) => {
  const min = Number(req.query.min || 10);
  const params = [min];
  const whereDates = dateClause('p.booking_date', req, params);
  const sql = `
    SELECT p.parcel_id, p.weight_kg, p.type, p.status, p.booking_date, p.sender_id, p.receiver_id
    FROM parcel p
    WHERE p.weight_kg >= ? ${whereDates}
    ORDER BY p.weight_kg DESC, p.booking_date DESC
    LIMIT 200;
  `;
  db.query(sql, params, (err, rows) => err ? res.status(500).json(err) : res.json(rows));
});

module.exports = router;
