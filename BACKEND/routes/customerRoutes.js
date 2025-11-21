// backend/routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all customers
router.get('/', (req, res) => {
  db.query('SELECT * FROM customer', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Add a new customer
router.post('/', (req, res) => {
  const { name, phone, email, address, password } = req.body;

  if (!password || password.trim() === "") {
    return res.status(400).json({ message: "Password is required" });
  }

  const sql = 'INSERT INTO customer (name, phone, email, address, password) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [name, phone, email, address, password], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Customer added successfully!' });
  });
});

// Update a customer
router.put('/:id', (req, res) => {
  const { name, phone, address, password } = req.body;
  const { id } = req.params;

  let sql, params;

  if (password && password.trim() !== "") {
    sql = `UPDATE customer SET name=?, phone=?, address=?, password=? WHERE customer_id=?`;
    params = [name, phone, address, password, id];
  } else {
    sql = `UPDATE customer SET name=?, phone=?, address=? WHERE customer_id=?`;
    params = [name, phone, address, id];
  }

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Customer updated successfully!' });
  });
});

// Delete a customer
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM customer WHERE customer_id=?', [id], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Customer deleted successfully!' });
  });
});

module.exports = router;
