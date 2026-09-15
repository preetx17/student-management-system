const db = require("./db");

db.query("SELECT id, name, photo FROM students WHERE id=101", (err, result) => {
    if (err) throw err;
    console.log("DB Result:", result);
    process.exit(0);
});
