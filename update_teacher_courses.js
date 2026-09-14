const db = require("./db");

const alterTableSql = `
    ALTER TABLE teachers 
    ADD COLUMN course1 VARCHAR(100) DEFAULT NULL,
    ADD COLUMN course2 VARCHAR(100) DEFAULT NULL;
`;

db.query(alterTableSql, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns course1 and course2 already exist.");
            process.exit(0);
        }
        console.error("Error altering teachers table:", err);
        process.exit(1);
    }
    console.log("Teachers table updated with courses successfully.");
    process.exit(0);
});
