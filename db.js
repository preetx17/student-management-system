require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "sms",
    ssl: (process.env.DB_SSL === "true" || (process.env.DB_HOST && process.env.DB_HOST !== "localhost" && process.env.DB_HOST !== "127.0.0.1")) 
        ? { rejectUnauthorized: false } 
        : undefined
});

function initDatabase() {
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

    for (const q of queries) {
        db.query(q, (err) => {
            if (err) console.error("Auto DB Init query error:", err.message);
        });
    }
}

db.connect((err) => {
    if (err) {
        console.error("Database connection error:", err);
    } else {
        console.log("Connected to MySQL successfully!");
        initDatabase();
    }
});

module.exports = db;