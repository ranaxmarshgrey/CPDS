



-- TRIGGER 1 
-- Auto-update parcel status when delivery is marked as Delivered
DELIMITER $$
CREATE TRIGGER trg_update_parcel_on_delivery
AFTER UPDATE ON delivery
FOR EACH ROW
BEGIN
    IF NEW.status = 'Delivered' THEN
        UPDATE parcel
        SET status = 'Delivered'
        WHERE parcel_id = NEW.parcel_id;
    END IF;
END$$
DELIMITER ;

--Explanation:
-- Whenever a delivery’s status changes to “Delivered”,
-- this trigger automatically updates the corresponding
-- parcel status to “Delivered”.



-- TRIGGER 2
-- Prevent deleting a delivery agent if they have active deliveries
DELIMITER $$
CREATE TRIGGER trg_prevent_agent_delete
BEFORE DELETE ON delivery_agent
FOR EACH ROW
BEGIN
    DECLARE active_deliveries INT;

    SELECT COUNT(*) INTO active_deliveries
    FROM delivery
    WHERE agent_id = OLD.agent_id
      AND status NOT IN ('Delivered', 'Cancelled');

    IF active_deliveries > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot delete delivery agent with active deliveries!';
    END IF;
END$$
DELIMITER ;

--Explanation:
-- This trigger prevents deleting any delivery agent
-- who is still handling active deliveries.



--STORED PROCEDURE
-- Add new parcel and automatically assign delivery
DELIMITER $$
CREATE PROCEDURE add_and_assign_parcel(
    IN p_weight DECIMAL(10,2),
    IN p_type VARCHAR(50),
    IN p_dimensions VARCHAR(50),
    IN p_sender INT,
    IN p_receiver INT,
    IN p_agent INT,
    IN p_vehicle INT
)
BEGIN
    DECLARE new_parcel_id INT;
    DECLARE route_id INT;

    -- Insert new parcel
    INSERT INTO parcel (weight_kg, type, dimensions, sender_id, receiver_id, status, booking_date)
    VALUES (p_weight, p_type, p_dimensions, p_sender, p_receiver, 'Booked', NOW());

    SET new_parcel_id = LAST_INSERT_ID();

    -- Auto-generate route ID
    SET route_id = FLOOR(100 + (RAND() * 900));

    -- Assign delivery automatically
    INSERT INTO delivery (parcel_id, agent_id, vehicle_id, route_id, dispatch_date, status)
    VALUES (new_parcel_id, p_agent, p_vehicle, route_id, NOW(), 'Dispatched');

    -- Add tracking entry
    INSERT INTO tracking (parcel_id, status, location_update)
    VALUES (new_parcel_id, 'Out for Delivery', 'Customer Address');
END$$
DELIMITER ;

-- Explanation:
-- This procedure handles parcel booking + automatic delivery assignment.
-- Reduces manual work for admins.



-- FUNCTION 1
-- Calculate total parcels sent by a customer
DELIMITER $$
CREATE FUNCTION total_parcels_sent(cust_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total
    FROM parcel
    WHERE sender_id = cust_id;
    RETURN total;
END$$
DELIMITER ;

-- Explanation:
-- Returns how many parcels a particular customer has sent.



--FUNCTION 2
-- Calculate total revenue collected for a parcel
DELIMITER $$
CREATE FUNCTION parcel_revenue(p_id INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE amount DECIMAL(10,2);
    SELECT SUM(amount_paid) INTO amount
    FROM payment
    WHERE parcel_id = p_id;
    RETURN IFNULL(amount, 0.00);
END$$
DELIMITER ;

--Explanation:
-- Returns the total payment amount collected for a given parcel.



-- Show triggers
SHOW TRIGGERS;

-- Show procedures
SHOW PROCEDURE STATUS WHERE Db = 'cpds';
CALL get_parcel_summary(5);
-- Show functions
SHOW FUNCTION STATUS WHERE Db = 'cpds';
SELECT estimate_delivery(7.5, 1200);
