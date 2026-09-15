require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const sanitizeHtml = require("sanitize-html");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const COURSE_MAPPING = {
    'cs': 'computer science',
    'eng': 'English',
    'sci': 'science',
    'eco': 'economics',
    'math': 'mathematics'
};
const ALLOWED_COURSES = ['computer science', 'English', 'science', 'economics', 'mathematics'];

function processCourse(inputCourse) {
    if (!inputCourse) return null;
    const lower = inputCourse.toLowerCase().trim();
    const mapped = COURSE_MAPPING[lower] || lower;
    if (ALLOWED_COURSES.map(c => c.toLowerCase()).includes(mapped.toLowerCase())) {
        return ALLOWED_COURSES.find(c => c.toLowerCase() === mapped.toLowerCase());
    }
    return null;
}

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
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

app.use(helmet({
    contentSecurityPolicy: false // Disabled so inline scripts and external CDNs don't break
}));

app.use(express.json());

// Global Input Sanitization Middleware
const sanitizeMiddleware = (req, res, next) => {
    const sanitizeObj = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                obj[key] = sanitizeHtml(obj[key], {
                    allowedTags: [], // Disallow all HTML tags
                    allowedAttributes: {}
                });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                sanitizeObj(obj[key]);
            }
        }
    };
    
    if (req.body) sanitizeObj(req.body);
    if (req.query) sanitizeObj(req.query);
    if (req.params) sanitizeObj(req.params);
    
    next();
};
app.use(sanitizeMiddleware);

// Trust proxy if behind a load balancer (like Render or Heroku)
app.set('trust proxy', 1);

// Enforce HTTPS in production
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'student-management-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // True if on HTTPS
        httpOnly: true, // Prevents client-side JS from reading the cookie
        sameSite: 'lax' // CSRF protection
    }
}));
app.use(express.static("public"));

async function isPasswordUnique(plainPassword) {
    return new Promise((resolve, reject) => {
        db.query("SELECT password FROM teachers", (err, results) => {
            if (err) return reject(err);
            for (let row of results) {
                if (row.password && (row.password.startsWith("$2b$") || row.password.startsWith("$2a$"))) {
                    if (bcrypt.compareSync(plainPassword, row.password)) {
                        return resolve(false); 
                    }
                } else if (row.password === plainPassword) {
                    return resolve(false); 
                }
            }
            resolve(true); 
        });
    });
}

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per window
    message: { success: false, message: "Too many login attempts, please try again after 15 minutes" }
});
app.use("/login", loginLimiter);

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM teachers WHERE username = ?";
    db.query(sql, [username], async (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Database error" });
        }
        if (result.length > 0) {
            let match = false;
            if (result[0].password.startsWith("$2b$") || result[0].password.startsWith("$2a$")) {
                match = await bcrypt.compare(password, result[0].password);
            } else {
                match = (password === result[0].password);
            }

            if (match) {
                req.session.teacherLoggedIn = true;
                req.session.username = username;
                req.session.role = result[0].role;
                return res.json({ success: true });
            } else {
                return res.status(401).json({ success: false, message: "Invalid Username or Password" });
            }
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

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 16 || numAge > 25) {
        return res.status(400).json({ success: false, message: "Age must be between 16 and 25" });
    }

    const finalCourse = processCourse(course);
    if (!finalCourse) {
        return res.status(400).json({ success: false, message: "Invalid course. Allowed courses: computer science, English, science, economics, mathematics." });
    }

    const sql = `
        INSERT INTO students (id, name, age, course, email, photo)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [id, name, numAge, finalCourse, email, photo], (err, result) => {

        if (err) {
            console.log(err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: "This Student ID or Email is already registered" });
            }

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
app.post("/students/bulk", requireAuth, (req, res) => {
    const studentsArray = req.body.students;
    if (!Array.isArray(studentsArray) || studentsArray.length === 0) {
        return res.status(400).json({ success: false, message: "No student data provided." });
    }

    const values = [];
    for (let i = 0; i < studentsArray.length; i++) {
        let { id, name, age, course, email } = studentsArray[i];
        
        const numAge = parseInt(age, 10);
        if (isNaN(numAge) || numAge < 16 || numAge > 25) {
            continue;
        }
        
        const finalCourse = processCourse(course);
        if (!finalCourse) {
            continue;
        }
        
        values.push([id, name, numAge, finalCourse, email, null]);
    }

    if (values.length === 0) {
        return res.status(400).json({ success: false, message: "No valid student records found to import." });
    }

    const sql = `
        INSERT IGNORE INTO students (id, name, age, course, email, photo)
        VALUES ?
    `;

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Database error during bulk import." });
        }

        res.json({
            success: true,
            message: `Successfully imported ${result.affectedRows} students. ${values.length - result.affectedRows} skipped (duplicates).`,
            importedCount: result.affectedRows
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

    const { name, age, course, email } = req.body;

    const numAge = parseInt(age, 10);
    if (isNaN(numAge) || numAge < 16 || numAge > 25) {
        return res.status(400).json({ success: false, message: "Age must be between 16 and 25" });
    }

    const finalCourse = processCourse(course);
    if (!finalCourse) {
        return res.status(400).json({ success: false, message: "Invalid course. Allowed courses: computer science, English, science, economics, mathematics." });
    }

    let sql;
    let params;

    if (req.file) {
        const photo = `/uploads/${req.file.filename}`;
        sql = `
            UPDATE students
            SET name=?, age=?, course=?, email=?, photo=?
            WHERE id=?
        `;
        params = [name, numAge, finalCourse, email, photo, id];
    } else if (req.body.removePhoto === "true") {
        sql = `
            UPDATE students
            SET name=?, age=?, course=?, email=?, photo=NULL
            WHERE id=?
        `;
        params = [name, numAge, finalCourse, email, id];
    } else {
        sql = `
            UPDATE students
            SET name=?, age=?, course=?, email=?
            WHERE id=?
        `;
        params = [name, numAge, finalCourse, email, id];
    }

    db.query(sql, params, (err, result) => {

        if (err) {
            console.log(err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ success: false, message: "This Email is already registered" });
            }

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




app.get("/api/teachers", requireAuth, (req, res) => {
    let sql = "SELECT id, username, name, age, department, photo, course1, course2, role FROM teachers";
    
    if (req.session.role !== 'owner') {
        sql += " WHERE role = 'teacher'";
    }
    
    db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: "Failed to fetch teachers" });
        }
        res.json({ success: true, teachers: result });
    });
});

app.get("/api/teacher/profile", requireAuth, (req, res) => {
    const username = req.session.username;
    const sql = "SELECT id, username, name, age, department, photo, course1, course2 FROM teachers WHERE username = ?";
    db.query(sql, [username], (err, result) => {
        if (err || result.length === 0) {
            return res.status(500).json({ success: false, message: "Error fetching profile" });
        }
        res.json({ success: true, profile: result[0] });
    });
});

app.put("/api/teacher/profile", requireAuth, upload.single('photo'), (req, res) => {
    const username = req.session.username;
    const { newUsername, name, age, department, newPassword, course1, course2 } = req.body;
    const targetUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : username;
    const parsedAge = (age !== undefined && age !== "" && !isNaN(parseInt(age, 10))) ? parseInt(age, 10) : null;
    
    const updateProfile = async () => {
        let baseSql = "UPDATE teachers SET username=?, name=?, age=?, department=?, course1=?, course2=?";
        let baseParams = [targetUsername, (name && name.trim()) ? name.trim() : null, parsedAge, (department && department.trim()) ? department.trim() : null, course1 || null, course2 || null];

        if (newPassword && newPassword.trim()) {
            const isUnique = await isPasswordUnique(newPassword);
            if (!isUnique) {
                return res.status(400).json({ success: false, message: "This password is already in use by another teacher. Please choose a unique password." });
            }
            const hash = await bcrypt.hash(newPassword, 10);
            baseSql += ", password=?";
            baseParams.push(hash);
        }
        
        if (req.file) {
            const photo = `/uploads/${req.file.filename}`;
            baseSql += ", photo=?";
            baseParams.push(photo);
        } else if (req.body.removePhoto === "true") {
            baseSql += ", photo=NULL";
        }

        baseSql += " WHERE username=?";
        baseParams.push(username);

        db.query(baseSql, baseParams, (err, result) => {
            if (err) {
                console.error("Profile update error:", err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: "Username already exists" });
                }
                return res.status(500).json({ success: false, message: err.sqlMessage || "Error updating profile" });
            }
            if (targetUsername !== username) {
                req.session.username = targetUsername;
                req.session.save((err) => {
                    res.json({ success: true, message: "Profile updated successfully!" });
                });
            } else {
                res.json({ success: true, message: "Profile updated successfully!" });
            }
        });
    };
    
    updateProfile().catch(err => {
        console.error("Profile update error:", err);
        res.status(500).json({ success: false, message: "Server error" });
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
        
        isPasswordUnique(password).then(isUnique => {
            if (!isUnique) {
                return res.status(400).json({ success: false, message: "This password is already in use by another teacher. Please choose a unique password." });
            }
            
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) return res.status(500).json({ success: false, message: "Error encrypting password" });

                const sql = "INSERT INTO teachers (username, password, role) VALUES (?, ?, 'teacher')";
                db.query(sql, [username, hash], (err, result) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({ success: false, message: "Username already exists" });
                        }
                        return res.status(500).json({ success: false, message: "Database error" });
                    }
                    res.json({ success: true, message: "Sign up successful! Please log in." });
                });
            });
        }).catch(err => {
            return res.status(500).json({ success: false, message: "Server error checking password uniqueness" });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});