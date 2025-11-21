📦 Courier & Parcel Delivery System (CPDS)

A full-stack Courier & Parcel Delivery System built using Node.js, Express.js, MySQL, HTML, CSS, JavaScript, designed with proper database concepts (Triggers, Procedures, Functions) and a clean Admin + Customer workflow.

This project simulates a real courier ecosystem:
✔ Parcel booking
✔ Warehouse handling
✔ Delivery assignment
✔ Real-time parcel tracking
✔ Customer feedback
✔ Admin management panel
✔ Authentication system

🚀 Features
🔐 1. Authentication System

Admin Login

Access to full dashboard

Manage customers, agents, parcels, tracking, warehouses

Customer Login

Track parcel live timeline

View delivery status

Submit feedback

🧑‍💼 2. Admin Panel Features

Manage Customers (CRUD)

Manage Delivery Agents (CRUD)

Add Parcels

Assign Warehouses

Release from Warehouse

Assign Delivery Agent + Vehicle

Mark Parcel Delivered

View Reports & Dashboard Charts

👤 3. Customer Panel Features

Track Parcel

View timeline

Feedback submission

📦 Real-Time Tracking System

Automatically builds a timeline of events using triggers + helper functions:

Event	Tracking Entry Auto-Generated
Parcel booked	"Parcel Booked"
Stored in warehouse	"Moved to Warehouse"
Released from warehouse	"Left Warehouse"
Delivery assigned	"Out for Delivery"
Delivered	"Delivered Successfully"

Tracking updates appear beautifully on the customer timeline UI.

🗄 Database Technology Used
✔ Tables Implemented

customer

admin_users

parcel

delivery

tracking

warehouse

parcel_warehouse

delivery_agent

vehicle

feedback

⚙ SQL Concepts Implemented
🟢 1. Triggers
Trigger 1 – Prevent Duplicate Emails
CREATE TRIGGER prevent_customer_email_duplicate
BEFORE INSERT ON customer
FOR EACH ROW
BEGIN
 IF EXISTS(SELECT 1 FROM customer WHERE email = NEW.email) THEN
   SIGNAL SQLSTATE '45000'
   SET MESSAGE_TEXT = 'Duplicate email not allowed.';
 END IF;
END;

Trigger 2 – Prevent Negative Weight
CREATE TRIGGER check_parcel_weight
BEFORE INSERT ON parcel
FOR EACH ROW
BEGIN
 IF NEW.weight_kg <= 0 THEN
   SIGNAL SQLSTATE '45000'
   SET MESSAGE_TEXT = 'Weight must be positive.';
 END IF;
END;

🟡 2. Stored Procedure
Procedure: Get all delivery details
CREATE PROCEDURE get_delivery_details()
BEGIN
 SELECT * FROM delivery;
END;


Call:

CALL get_delivery_details();

🔵 3. SQL Function
Function: Calculate Delivery Duration
CREATE FUNCTION getDeliveryDuration(d_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
 DECLARE days INT;
 SELECT TIMESTAMPDIFF(DAY, dispatch_date, delivery_date)
 INTO days
 FROM delivery
 WHERE delivery_id = d_id;
 RETURN days;
END;


Call:

SELECT getDeliveryDuration(21);

🌐 Backend Architecture (Node.js + Express)
Routes Implemented
Route	Functionality
/api/auth	Login for admin & customers
/api/customers	CRUD customer
/api/agents	CRUD delivery agents
/api/parcels	Add parcel
/api/delivery	Assign delivery, mark delivered
/api/warehouse	Assign/Release warehouse
/api/tracking	Fetch timeline
/api/dashboard	Summary, charts
/api/feedback	Customer feedback
🎨 Frontend (HTML + CSS + JS)
Pages Included

Login

Admin Dashboard

Customer Dashboard

Manage Customers

Manage Delivery Agents

Add Parcel

Assign Delivery

Assign/Release Warehouse

Parcel Timeline

Track Parcel

Feedback Page

All pages have:
✔ SweetAlert2 popups
✔ Clean UI
✔ Dark mode support in admin dashboard
✔ Responsive cards & tables

📊 Dashboard Features

Total Customers

Total Parcels

Total Deliveries

Weekly delivery chart

Delivery status donut chart

Live delivery table

Mark delivered button

🛠 Installation & Setup
1. Clone Repository
git clone https://github.com/ranaxmarshgrey/CPDS.git
cd CPDS

2. Install backend dependencies
cd backend
npm install

3. Import SQL Tables

Use the provided .sql schema file (you can generate from your DB).

4. Start Server
node server.js


Server runs at:

http://localhost:5000

🧪 Testing Triggers, Procedures, Functions
Test Trigger
INSERT INTO customer(name, phone, email, address, password)
VALUES("Test", "99999", "already@used.com", "Test", "pass");


→ Should throw trigger error.

Test Procedure
CALL get_delivery_details();

Test Function
SELECT getDeliveryDuration(31);

👨‍💻 Team

This project is built as part of DBMS Mini Project, PES University (RR), 2025.

⭐ Final Notes

This project was designed to demonstrate:

Real-world courier workflow

Proper database normalization

Use of triggers, functions, procedures

Clean role-based UI

Seamless integration between backend and frontend
