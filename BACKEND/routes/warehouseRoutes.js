const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Get all warehouses
router.get('/warehouses', (req, res) => {
  db.query('SELECT * FROM warehouse', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ✅ Get available parcels
router.get('/available-parcels', (req, res) => {
  const sql = `
    SELECT p.parcel_id, p.type, p.weight_kg
    FROM parcel p
    LEFT JOIN parcel_warehouse pw 
      ON p.parcel_id = pw.parcel_id 
      AND pw.exit_date IS NULL
    WHERE pw.parcel_id IS NULL;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ✅ Assign parcel
router.post('/assign', (req, res) => {
  const { parcel_id, warehouse_id } = req.body;

  // First get warehouse location
  db.query("SELECT location FROM warehouse WHERE warehouse_id = ?", [warehouse_id], (err, rows) => {
    const location = rows && rows[0] ? rows[0].location : "Warehouse";

    const sql = `INSERT INTO parcel_warehouse (parcel_id, warehouse_id, entry_date) VALUES (?, ?, NOW())`;

    db.query(sql, [parcel_id, warehouse_id], (err2) => {
      if (err2) return res.status(500).json(err2);

      // ✅ Add tracking
      db.addTracking(parcel_id, "Moved to Warehouse", location);

      res.json({ message: "Parcel stored in warehouse" });
    });
  });
});


// ✅ Release parcel
router.post('/release', (req, res) => {
  const { parcel_id } = req.body;
  const sql = `UPDATE parcel_warehouse SET exit_date = NOW() WHERE parcel_id = ? AND exit_date IS NULL`;
  db.query(sql, [parcel_id], (err) => {
    if (err) return res.status(500).json(err);
    db.addTracking(parcel_id, "Left Warehouse", "Warehouse Dispatch");

    res.json({ message: "Parcel released from warehouse" });
  });
});

module.exports = router;
