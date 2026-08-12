const db = require("./db");

const students = [];
const courses = ["Computer Science", "Information Technology", "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Business Administration", "Mathematics", "Physics", "Chemistry", "Biology"];

let startId = 2000;

for (let i = 1; i <= 100; i++) {
    const id = startId + i;
    const name = `Student ${i}`;
    const age = Math.floor(Math.random() * (25 - 18 + 1)) + 18;
    const course = courses[Math.floor(Math.random() * courses.length)];
    const email = `student${id}@example.com`;
    
    students.push([id, name, age, course, email]);
}

const insertSql = `
    INSERT IGNORE INTO students (id, name, age, course, email)
    VALUES ?
`;

db.query(insertSql, [students], (err, result) => {
    if (err) {
        console.error("Error inserting students:", err);
        process.exit(1);
    }
    console.log(`Successfully inserted ${result.affectedRows} fake students.`);
    process.exit(0);
});
