// backend/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Pes/Jayanth/2023', // your MySQL password
  database: 'cpds'
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('✅ Connected to MySQL database.');
  }
});
// ADD TRACKING HELPER
db.addTracking = function(parcel_id, status, location) {
    const sql = `
        INSERT INTO tracking (parcel_id, status, location_update)
        VALUES (?, ?, ?)
    `;
    db.query(sql, [parcel_id, status, location], (err) => {
        if (err) console.error("Tracking insert failed:", err);
    });
};
module.exports = db;
