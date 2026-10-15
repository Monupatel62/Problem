-- Write your SQL query below.
-- Tables available: Person(personId, lastName, firstName), Address(addressId, personId, city, state)
-- Return: firstName, lastName, city, state for every person (null if no address).

SELECT
    p.firstName,
    p.lastName,
    a.city,
    a.state
FROM Person p
LEFT JOIN Address a ON p.personId = a.personId;
