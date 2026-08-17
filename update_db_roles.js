const db = require("./db");

const alterTeachersSql = `
    ALTER TABLE teachers 
    ADD COLUMN role VARCHAR(50) DEFAULT 'teacher';
`;

const updateOwnerSql = `
    UPDATE teachers SET role = 'owner';
`;

const createSettingsSql = `
    CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(50) PRIMARY KEY,
        key_value VARCHAR(255)
    );
`;

const insertInitialInviteCodeSql = `
    INSERT IGNORE INTO settings (key_name, key_value) VALUES ('invite_code', 'TEACHER2026');
`;

db.query(alterTeachersSql, (err) => {
    if (err && err.code !== 'ER_DUP_FIELDNAME') {
        console.error("Error altering teachers table:", err);
    }
    
    db.query(updateOwnerSql, (err) => {
        if (err) console.error("Error setting existing users as owner:", err);
        
        db.query(createSettingsSql, (err) => {
            if (err) {
                console.error("Error creating settings table:", err);
                process.exit(1);
            }
            
            db.query(insertInitialInviteCodeSql, (err) => {
                if (err) {
                    console.error("Error inserting invite code:", err);
                    process.exit(1);
                }
                
                console.log("Database updated successfully for Roles and Settings.");
                process.exit(0);
            });
        });
    });
});
