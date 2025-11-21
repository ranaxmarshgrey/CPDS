const express = require("express");
const router = express.Router();
const db = require("../db");

// Mark delivery as delivered (triggers fire here)
router.post("/mark-delivered/:parcel_id", (req, res) => {
  const { parcel_id } = req.params;

  const sql = `UPDATE delivery SET status = 'Delivered', delivery_date = NOW()
               WHERE parcel_id = ?`;

  db.query(sql, [parcel_id], (err, result) => {
    if (err) return res.status(500).json(err);

    if (result.affectedRows === 0)
      return res.status(404).json({ message: "No such parcel or delivery found" });

    // Trigger fires here automatically in DB
    res.json({ message: "✅ Delivery marked as Delivered (Trigger executed)" });
  });
});

module.exports = router;
