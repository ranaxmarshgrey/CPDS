const express = require("express");
const router = express.Router();
const db = require("../db");

// Add feedback
router.post("/", (req, res) => {
  const { parcel_id, customer_id, rating, comments } = req.body;

  if (!parcel_id || !customer_id || !rating) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const sql = `
    INSERT INTO feedback (parcel_id, customer_id, rating, comments)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [parcel_id, customer_id, rating, comments], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Feedback submitted ✅" });
  });
});

// Get recent feedback
router.get("/", (req, res) => {
  const sql = `
    SELECT f.rating, f.comments, f.review_date, c.name as customer, p.parcel_id
    FROM feedback f
    JOIN customer c ON f.customer_id = c.customer_id
    JOIN parcel p ON f.parcel_id = p.parcel_id
    ORDER BY f.review_date DESC
    LIMIT 10;
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;
