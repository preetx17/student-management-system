DELIMITER //

DROP TRIGGER IF EXISTS prevent_multiple_owners_insert //
CREATE TRIGGER prevent_multiple_owners_insert
BEFORE INSERT ON teachers
FOR EACH ROW
BEGIN
    IF NEW.role = 'owner' THEN
        IF (SELECT COUNT(*) FROM teachers WHERE role = 'owner') >= 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only one owner is allowed.';
        END IF;
    END IF;
END; //

DROP TRIGGER IF EXISTS prevent_multiple_owners_update //
CREATE TRIGGER prevent_multiple_owners_update
BEFORE UPDATE ON teachers
FOR EACH ROW
BEGIN
    IF NEW.role = 'owner' AND OLD.role != 'owner' THEN
        IF (SELECT COUNT(*) FROM teachers WHERE role = 'owner') >= 1 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Only one owner is allowed.';
        END IF;
    END IF;
END; //

DELIMITER ;
