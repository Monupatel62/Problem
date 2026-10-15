-- Write your SQL query below.
-- Tables: Customers(id, name), Orders(id, customerId)
-- Return one column named Customers for customers with no orders.

SELECT c.name AS Customers
FROM Customers AS c
LEFT JOIN Orders AS o ON c.id = o.customerId
WHERE o.customerId IS NULL;
