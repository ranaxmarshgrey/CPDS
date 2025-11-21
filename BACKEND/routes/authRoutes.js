const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Login route for Admin + Customer
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // ✅ 1. Check Admin first
  const adminQuery = "SELECT * FROM admin_users WHERE email = ? AND password = ?";
  db.query(adminQuery, [email, password], (err, adminResult) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (adminResult.length > 0) {
      return res.json({
        role: "admin",
        admin_id: adminResult[0].admin_id,
        username: adminResult[0].username
      });
    }

    // ✅ 2. If not admin → check Customer
    const customerQuery =
      "SELECT customer_id, name, email FROM customer WHERE email = ? AND password = ?";

    db.query(customerQuery, [email, password], (err2, customerResult) => {
      if (err2) return res.status(500).json({ error: "Database error" });

      if (customerResult.length > 0) {
        return res.json({
          role: "customer",
          customer_id: customerResult[0].customer_id,
          name: customerResult[0].name
        });
      }

      // ✅ 3. If not found anywhere → invalid login
      res.status(401).json({ message: "Invalid email or password" });
    });
  });
});

module.exports = router;
