const db = require("./db");

const alterTableSql = `
    ALTER TABLE students 
    ADD COLUMN photo VARCHAR(255) DEFAULT NULL;
`;

db.query(alterTableSql, (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column 'photo' already exists.");
            process.exit(0);
        }
        console.error("Error altering table:", err);
        process.exit(1);
    }
    console.log("Students table updated with photo column.");
    process.exit(0);
});
