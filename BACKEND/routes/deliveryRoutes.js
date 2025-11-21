// backend/routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get("/agents", (req, res) => {
  const sql = `
    SELECT agent_id, name, phone, assigned_area AS region, employment_type AS email
    FROM delivery_agent
    ORDER BY agent_id ASC;
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json(results);
  });
});


// ✅ Fetch all vehicles
router.get("/vehicles", (req, res) => {
  const sql = "SELECT vehicle_id, vehicle_no FROM vehicle";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "Database error", details: err });
    res.json(results);
  });
});

// ✅ Get all deliveries
router.get('/', (req, res) => {
  db.query('SELECT * FROM delivery', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ✅ Assign a delivery (auto route_id + dispatch_date)
router.post('/', (req, res) => {
  const { parcel_id, agent_id, vehicle_id } = req.body;

  if (!parcel_id || !agent_id || !vehicle_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Auto-generate a simple route_id (for demo purpose)
  const route_id = Math.floor(Math.random() * 900) + 100; // random 100–999

  const sql = `
    INSERT INTO delivery (parcel_id, agent_id, vehicle_id, route_id, dispatch_date, status)
    VALUES (?, ?, ?, ?, NOW(), 'Dispatched')
  `;

  db.query(sql, [parcel_id, agent_id, vehicle_id, route_id], (err) => {
    if (err) return res.status(500).json(err);
    db.addTracking(parcel_id, "Out for Delivery", null);

    res.json({
      message: `✅ Delivery assigned successfully (Route ID: ${route_id})`,
      route_id: route_id
    });
  });
});

// 📊 Get delivery status summary
router.get('/stats/status', (req, res) => {
  const sql = `
    SELECT status, COUNT(*) AS count
    FROM delivery
    GROUP BY status
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const stats = {};
    results.forEach(r => { stats[r.status] = r.count });
    res.json(stats);
  });
});

// ✅ Get parcels awaiting delivery assignment
router.get("/unassigned", (req, res) => {
  const sql = `
    SELECT 
      p.parcel_id, 
      p.type, 
      p.weight_kg, 
      p.status, 
      p.booking_date, 
      c.name AS customer
    FROM parcel p
    JOIN customer c ON p.sender_id = c.customer_id
    WHERE p.parcel_id NOT IN (SELECT parcel_id FROM delivery)
      AND p.status NOT IN ('Delivered')
    ORDER BY p.booking_date DESC;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching unassigned parcels:", err);
      return res.status(500).json({ error: "Database error", details: err });
    }
    res.json(result);
  });
});


// ✅ Mark a parcel as delivered (safe separate queries)
router.post("/mark-delivered/:parcel_id", (req, res) => {
  const parcelId = req.params.parcel_id;

  const updateDelivery = `UPDATE delivery SET status='Delivered', delivery_date=NOW() WHERE parcel_id = ?`;
  const updateParcel = `UPDATE parcel SET status='Delivered' WHERE parcel_id = ?`;

  db.query(updateDelivery, [parcelId], (err) => {
    if (err) {
      console.error("Delivery update failed:", err);
      return res.status(500).json({ error: "Failed to update delivery table" });
    }

    db.query(updateParcel, [parcelId], (err2) => {
      if (err2) {
        console.error("Parcel update failed:", err2);
        return res.status(500).json({ error: "Failed to update parcel table" });
      }
      db.addTracking(parcelId, "Delivered Successfully", "Destination");

      res.json({ message: "✅ Parcel marked as delivered successfully!" });
    });
  });
});

module.exports = router;
