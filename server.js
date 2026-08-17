const express = require("express");
const session = require("express-session");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const app = express();

const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

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
            req.session.username = username;
            req.session.role = result[0].role; // Store role in session
            return res.json({ success: true });
        } else {
            return res.status(401).json({ success: false, message: "Invalid Username or Password" });
        }
    });
});

app.get("/check-auth", (req, res) => {
    if (req.session.teacherLoggedIn) {
        res.json({ authenticated: true, username: req.session.username, role: req.session.role });
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

app.post("/students", requireAuth, upload.single('photo'), (req, res) => {

    const { id, name, age, course, email } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
        INSERT INTO students (id, name, age, course, email, photo)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [id, name, age, course, email, photo], (err, result) => {

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







app.put("/students/:id", requireAuth, upload.single('photo'), (req, res) => {

    const id = req.params.id;

    const { newId, name, age, course, email } = req.body;
    const targetId = newId ? newId : id;

    let sql;
    let params;

    if (req.file) {
        const photo = `/uploads/${req.file.filename}`;
        sql = `
            UPDATE students
            SET id=?, name=?, age=?, course=?, email=?, photo=?
            WHERE id=?
        `;
        params = [targetId, name, age, course, email, photo, id];
    } else {
        sql = `
            UPDATE students
            SET id=?, name=?, age=?, course=?, email=?
            WHERE id=?
        `;
        params = [targetId, name, age, course, email, id];
    }

    db.query(sql, params, (err, result) => {

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




app.get("/api/teacher/profile", requireAuth, (req, res) => {
    const username = req.session.username;
    const sql = "SELECT id, username, name, age, department, photo FROM teachers WHERE username = ?";
    db.query(sql, [username], (err, result) => {
        if (err || result.length === 0) {
            return res.status(500).json({ success: false, message: "Error fetching profile" });
        }
        res.json({ success: true, profile: result[0] });
    });
});

app.put("/api/teacher/profile", requireAuth, upload.single('photo'), (req, res) => {
    const username = req.session.username;
    const { newUsername, name, age, department, newPassword } = req.body;
    const targetUsername = newUsername || username;
    
    let sql, params;
    let baseSql = "UPDATE teachers SET username=?, name=?, age=?, department=?";
    let baseParams = [targetUsername, name, age, department];

    if (newPassword) {
        baseSql += ", password=?";
        baseParams.push(newPassword);
    }
    
    if (req.file) {
        const photo = `/uploads/${req.file.filename}`;
        baseSql += ", photo=?";
        baseParams.push(photo);
    }

    baseSql += " WHERE username=?";
    baseParams.push(username);

    sql = baseSql;
    params = baseParams;

    db.query(sql, params, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Error updating profile" });
        }
        if (targetUsername !== username) {
            req.session.username = targetUsername;
        }
        res.json({ success: true, message: "Profile updated successfully!" });
    });
});

app.post("/students/:id/photo", requireAuth, upload.single('photo'), (req, res) => {
    const id = req.params.id;
    if (!req.file) return res.status(400).json({ success: false, message: "No photo uploaded" });
    
    const photo = `/uploads/${req.file.filename}`;
    const sql = "UPDATE students SET photo=? WHERE id=?";
    
    db.query(sql, [photo, id], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: "Error updating student photo" });
        res.json({ success: true, message: "Photo added successfully!", photo: photo });
    });
});


app.post("/signup", (req, res) => {
    const { username, password, inviteCode } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
    }
    
    // Fetch secret invite code from settings table
    db.query("SELECT key_value FROM settings WHERE key_name = 'invite_code'", (err, result) => {
        if (err || result.length === 0) {
            return res.status(500).json({ success: false, message: "System configuration error." });
        }
        
        const SECRET_INVITE = result[0].key_value;
        
        if (inviteCode !== SECRET_INVITE) {
            return res.status(401).json({ success: false, message: "Invalid Invite Code. You do not have permission to register." });
        }
        
        const sql = "INSERT INTO teachers (username, password, role) VALUES (?, ?, 'teacher')";
        db.query(sql, [username, password], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: "Username already exists" });
                }
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true, message: "Sign up successful! Please log in." });
        });
    });
});

// Admin Route to fetch current invite code
app.get("/api/settings/invite-code", requireAuth, (req, res) => {
    if (req.session.role !== 'owner') {
        return res.status(403).json({ success: false, message: "Forbidden: Owners only" });
    }
    db.query("SELECT key_value FROM settings WHERE key_name = 'invite_code'", (err, result) => {
        if (err || result.length === 0) return res.status(500).json({ success: false });
        res.json({ success: true, inviteCode: result[0].key_value });
    });
});

// Admin Route to update invite code
app.put("/api/settings/invite-code", requireAuth, (req, res) => {
    if (req.session.role !== 'owner') {
        return res.status(403).json({ success: false, message: "Forbidden: Owners only" });
    }
    const { newCode } = req.body;
    if (!newCode) return res.status(400).json({ success: false, message: "Code required" });
    
    db.query("UPDATE settings SET key_value = ? WHERE key_name = 'invite_code'", [newCode], (err) => {
        if (err) return res.status(500).json({ success: false, message: "Failed to update code" });
        res.json({ success: true, message: "Invite code updated successfully!" });
    });
});

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});