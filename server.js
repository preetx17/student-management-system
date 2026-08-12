const express = require("express");
const session = require("express-session");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(session({
    secret: 'student-management-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));
app.use(express.static("public"));

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM teachers WHERE username = ? AND password = ?";
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (result.length > 0) {
            req.session.teacherLoggedIn = true;
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false, message: "Invalid Username or Password" });
        }
    });
});

app.get("/check-auth", (req, res) => {
    if (req.session.teacherLoggedIn) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

app.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: "Failed to logout" });
        }
        res.json({ success: true });
    });
});

const requireAuth = (req, res, next) => {
    if (req.session.teacherLoggedIn) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

app.post("/students", requireAuth, (req, res) => {

    const { id, name, age, course, email } = req.body;

    const sql = `
        INSERT INTO students (id, name, age, course, email)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [id, name, age, course, email], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Failed to add student"
            });
        }

        res.status(201).json({
            success: true,
            message: "Student added successfully"
        });

    });

});



app.get("/students", requireAuth, (req, res) => {

    const sql = "SELECT * FROM students";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Failed to fetch students"
            });
        }

        res.json(result);

    });

});
app.get("/students/:search", requireAuth, (req, res) => {

    const search = req.params.search;

    const sql = `
        SELECT * FROM students
        WHERE id = ? OR name LIKE ?
    `;

    db.query(sql, [search, `%${search}%`], (err, result) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: "Database Error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Student Not Found"
            });
        }

        res.json(result[0]);

    });

});







app.put("/students/:id", requireAuth, (req, res) => {

    const id = req.params.id;

    const { name, age, course, email } = req.body;

    const sql = `
        UPDATE students
        SET name=?, age=?, course=?, email=?
        WHERE id=?
    `;

    db.query(sql, [name, age, course, email, id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Update Failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student Not Found"
            });
        }

        res.json({
            success: true,
            message: "Student Updated Successfully"
        });

    });

});



app.delete("/students/:id", requireAuth, (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM students WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Delete Failed"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Student Not Found"
            });
        }

        res.json({
            success: true,
            message: "Student Deleted Successfully"
        });

    });

});




app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});