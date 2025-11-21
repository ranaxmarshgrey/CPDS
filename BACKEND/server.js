// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// === Serve Frontend Files ===
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));


// === Import Routes ===
const customerRoutes = require('./routes/customerRoutes');
const parcelRoutes = require('./routes/parcelRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reportsRoutes = require('./routes/reportsRoutes');
const adminActions = require('./routes/adminActions');
const warehouseRoutes = require('./routes/warehouseRoutes');
const feedbackRoutes = require("./routes/feedbackRoutes");
const deliveryStatusRoutes = require('./routes/deliveryStatusRoutes');



const deliveryAgentRoutes = require('./routes/deliveryAgentRoutes');
const authRoutes = require("./routes/authRoutes");



// === Use Routes ===
app.use("/api/auth", authRoutes);
app.use('/api/agents', deliveryAgentRoutes);

app.use('/api/delivery-status', deliveryStatusRoutes);
app.use('/api/admin', adminActions);
app.use('/api/warehouse', warehouseRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use('/api/reports', reportsRoutes);

app.use('/api/customers', customerRoutes);
app.use('/api/parcels', parcelRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/dashboard', dashboardRoutes);
// === Start Server ===
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
