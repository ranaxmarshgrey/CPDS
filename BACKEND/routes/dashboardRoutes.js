// backend/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Summary - total counts
router.get("/summary", (req, res) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM customer) AS customers,
      (SELECT COUNT(*) FROM parcel) AS parcels,
      (SELECT COUNT(*) FROM delivery) AS deliveries;
  `;
  db.query(query, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result[0]);
  });
});

// ✅ Recent parcels
router.get("/recent-parcels", (req, res) => {
  db.query(
    `SELECT parcel_id, type, weight_kg, status, booking_date
     FROM parcel
     ORDER BY booking_date DESC
     LIMIT 10`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

// ✅ Delivery status (Pie chart)
router.get("/delivery-status", (req, res) => {
  db.query(
    `SELECT status, COUNT(*) AS count
     FROM parcel
     GROUP BY status`,
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json(result);
    }
  );
});

// ✅ Live delivery table 
router.get("/delivery-list", (req, res) => {
  const sql = `
    SELECT 
      d.parcel_id, 
      da.name AS agent_name, 
      v.vehicle_no, 
      d.status, 
      DATE_FORMAT(d.dispatch_date, '%Y-%m-%d') AS dispatch_date
    FROM delivery d
    JOIN delivery_agent da ON d.agent_id = da.agent_id
    JOIN vehicle v ON d.vehicle_id = v.vehicle_id
    ORDER BY FIELD(d.status, 'Booked', 'In Transit', 'Out for Delivery', 'Delivered'), 
             d.dispatch_date DESC;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

module.exports = router;
