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

db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Connected to MySQL");
    }
});

module.exports = db;