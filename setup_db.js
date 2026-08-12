const db = require("./db");

const createTableSql = `
    CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255)
    );
`;

const insertAdminSql = `
    INSERT IGNORE INTO teachers (username, password) 
    VALUES ('teacher', '12345');
`;

db.query(createTableSql, (err, result) => {
    if (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
    console.log("Teachers table created or already exists.");

    db.query(insertAdminSql, (err, result) => {
        if (err) {
            console.error("Error inserting admin:", err);
            process.exit(1);
        }
        console.log("Admin teacher inserted or already exists.");
        process.exit(0);
    });
});
