const db = require("./db");

const alterTableSql = `
    ALTER TABLE teachers 
    ADD COLUMN name VARCHAR(255) DEFAULT 'Admin',
    ADD COLUMN age INT DEFAULT 30,
    ADD COLUMN department VARCHAR(255) DEFAULT 'Administration',
    ADD COLUMN photo VARCHAR(255) DEFAULT NULL;
`;

db.query(alterTableSql, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns already exist.");
            process.exit(0);
        }
        console.error("Error altering teachers table:", err);
        process.exit(1);
    }
    console.log("Teachers table updated successfully.");
    process.exit(0);
});
