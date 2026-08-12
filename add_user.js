const db = require("./db");

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error("Usage: node add_user.js <username> <password>");
    process.exit(1);
}

const [username, password] = args;

const sql = "INSERT INTO teachers (username, password) VALUES (?, ?)";

db.query(sql, [username, password], (err, result) => {
    if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error(`Error: Username '${username}' already exists.`);
        } else {
            console.error("Database error:", err);
        }
        process.exit(1);
    }

    console.log(`Successfully added user: ${username}`);
    process.exit(0);
});
