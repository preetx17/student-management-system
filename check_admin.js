const db = require("./db");
db.query("SELECT username, name FROM teachers WHERE role = 'owner'", (err, results) => {
    if(err) {
        console.error(err);
    } else {
        console.log(JSON.stringify(results, null, 2));
    }
    process.exit(0);
});
