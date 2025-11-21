// backend/routes/parcelRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all parcels
router.get('/', (req, res) => {
  db.query('SELECT * FROM parcel', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Add a new parcel (with debug logging)
router.post('/', (req, res) => {
  const { weight_kg, type, dimensions, sender_id, receiver_id } = req.body;
  console.log("📦 Incoming Parcel Data:", req.body); // 👈 debug log

  const sql = `INSERT INTO parcel (weight_kg, type, dimensions, sender_id, receiver_id)
               VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [weight_kg, type, dimensions, sender_id, receiver_id], (err, result) => {
    if (err) {
      console.error("❌ SQL Error:", err); // 👈 show the error clearly
      return res.status(500).json({ message: 'Database error', error: err });
    }
    db.addTracking(result.insertId, "Parcel Booked", "Customer Address");
    console.log("✅ Parcel inserted successfully:", result.insertId);
    res.json({ message: 'Parcel booked successfully!' });
  });
});


module.exports = router;
