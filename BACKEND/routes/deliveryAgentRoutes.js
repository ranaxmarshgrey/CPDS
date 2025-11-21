// backend/routes/deliveryAgentRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Get all agents
router.get("/", (req, res) => {
  const sql = `
    SELECT agent_id, name, phone, assigned_area AS region, employment_type AS email
    FROM delivery_agent
    ORDER BY agent_id ASC;
  `;
  db.query(sql, (err, results) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    res.json(results);
  });
});

// ✅ Add new agent
router.post("/", (req, res) => {
  const { name, phone, email, region } = req.body;
  const sql = `
    INSERT INTO delivery_agent (name, phone, assigned_area, employment_type)
    VALUES (?, ?, ?, ?)
  `;
  db.query(sql, [name, phone, region, email], (err) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    res.json({ message: "✅ Delivery agent added successfully!" });
  });
});

// ✅ Update agent
router.put("/:id", (req, res) => {
  const { name, phone, email, region } = req.body;
  const { id } = req.params;
  const sql = `
    UPDATE delivery_agent
    SET name=?, phone=?, assigned_area=?, employment_type=?
    WHERE agent_id=?
  `;
  db.query(sql, [name, phone, region, email, id], (err) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    res.json({ message: "✅ Agent updated successfully!" });
  });
});

// ✅ Delete agent
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM delivery_agent WHERE agent_id=?", [id], (err) => {
    if (err)
      return res.status(500).json({ error: "Database error", details: err });
    res.json({ message: "🗑️ Agent deleted successfully!" });
  });
});

module.exports = router;
