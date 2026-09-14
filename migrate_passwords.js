require("dotenv").config();
const db = require("./db");
const bcrypt = require("bcrypt");

db.query("SELECT id, password FROM teachers", async (err, results) => {
    if (err) {
        console.error("Failed to fetch teachers:", err);
        process.exit(1);
    }

    for (let row of results) {
        // If it starts with $2b$, it's likely already a bcrypt hash
        if (row.password && (row.password.startsWith("$2b$") || row.password.startsWith("$2a$"))) {
            console.log(`Skipping ID ${row.id} - already encrypted`);
            continue;
        }

        try {
            const hash = await bcrypt.hash(row.password, 10);
            await new Promise((resolve, reject) => {
                db.query("UPDATE teachers SET password = ? WHERE id = ?", [hash, row.id], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
            console.log(`Successfully encrypted password for ID ${row.id}`);
        } catch (e) {
            console.error(`Error encrypting ID ${row.id}:`, e);
        }
    }

    console.log("Migration complete!");
    process.exit(0);
});
