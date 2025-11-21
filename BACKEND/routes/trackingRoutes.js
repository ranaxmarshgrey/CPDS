const express = require("express");
const router = express.Router();
const db = require("../db");

// 📦 Get full tracking + parcel details
router.get("/:parcel_id", (req, res) => {
  const parcel_id = req.params.parcel_id;

  // Query 1: Fetch parcel details
  const parcelQuery = "SELECT * FROM parcel WHERE parcel_id = ?";
  // Query 2: Fetch tracking history
  const trackingQuery =
    "SELECT tracking_id, parcel_id, location_update, timestamp, status FROM tracking WHERE parcel_id = ? ORDER BY timestamp ASC";

  db.query(parcelQuery, [parcel_id], (err, parcelResults) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    if (parcelResults.length === 0)
      return res.status(404).json({ message: "Parcel not found" });

    const parcel = parcelResults[0];

    db.query(trackingQuery, [parcel_id], (err2, trackingResults) => {
      if (err2) return res.status(500).json({ error: "Database error", details: err2 });

      res.json({
        parcel: {
          parcel_id: parcel.parcel_id,
          parcel_type: parcel.type,
          weight: parcel.weight_kg + " kg",
          dimensions: parcel.dimensions,
          status: parcel.status,
          booking_date: parcel.booking_date,
        },
        tracking_updates: trackingResults,
      });
    });
  });
});

// ➕ Add tracking update
router.post("/", (req, res) => {
  const { parcel_id, location_update, status } = req.body;
  const sql = `INSERT INTO tracking (parcel_id, location_update, status) VALUES (?, ?, ?)`;
  db.query(sql, [parcel_id, location_update, status], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Tracking update added!" });
  });
});

module.exports = router;
