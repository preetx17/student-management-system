const db = require("./db");

const queries = [
    `CREATE TABLE IF NOT EXISTS teachers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'teacher',
        name VARCHAR(255) DEFAULT 'Admin',
        age INT DEFAULT 30,
        department VARCHAR(255) DEFAULT 'Administration',
        photo VARCHAR(255) DEFAULT NULL,
        course1 VARCHAR(100) DEFAULT NULL,
        course2 VARCHAR(100) DEFAULT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        course VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        photo VARCHAR(255) DEFAULT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
        key_name VARCHAR(50) PRIMARY KEY,
        key_value VARCHAR(255)
    );`,
    `INSERT IGNORE INTO teachers (username, password, role, name, department) 
     VALUES ('teacher', '12345', 'owner', 'Admin Teacher', 'Administration');`,
    `INSERT IGNORE INTO settings (key_name, key_value) 
     VALUES ('invite_code', 'TEACHER2026');`
];

async function setup() {
    for (const query of queries) {
        await new Promise((resolve, reject) => {
            db.query(query, (err, result) => {
                if (err) {
                    console.error("Database setup query error:", err);
                    resolve(); // Continue even if duplicate
                } else {
                    resolve(result);
                }
            });
        });
    }
    console.log("✅ All tables and initial data successfully set up.");
    process.exit(0);
}

setup();

