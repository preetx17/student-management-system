const express = require("express");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(express.static("public"));



app.post("/students", (req, res) => {

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



app.get("/students", (req, res) => {

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
app.get("/students/:search", (req, res) => {

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







app.put("/students/:id", (req, res) => {

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



app.delete("/students/:id", (req, res) => {

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