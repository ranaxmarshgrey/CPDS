const express = require('express');
const router = express.Router();
const db = require('../db');

// ✅ Mark Parcel Delivered
router.post('/deliver/:parcel_id', (req, res) => {
  const parcel_id = req.params.parcel_id;
  
  db.query("CALL markParcelDelivered(?)", [parcel_id], (err, result) => {
    if (err) return res.status(500).json({ error: err.sqlMessage });
    res.json({ message: `Parcel ${parcel_id} marked as Delivered ✅` });
  });
});

module.exports = router;
