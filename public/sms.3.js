
const addForm= document.getElementById("addForm");
const searchInput= document.getElementById("searchInput");
const findStudentBtn= document.getElementById("findStudent");
const updateForm = document.getElementById("updateForm");
const deleteBtn = document.getElementById("deleteBtn");
const searchResult = document.getElementById("searchResult");



let students = [];

const navButtons = {
  dashboardBtn:     "dashboardSection",
  addStudentBtn:    "addSection",
  updateStudentBtn: "updateSection",
  searchStudentBtn: "searchSection",
  deleteStudentBtn: "deleteSection",
  studentListBtn:   "listSection",
};
if(localStorage.getItem("teacherLoggedIn") !== "true"){

    window.location.href = "teacher-login.html";
}

function showSection(sectionId){
  document.querySelectorAll(".content section").forEach(section => {
    section.classList.add("hide");
  });
  document.getElementById(sectionId).classList.remove("hide");
}


for (const [buttonId, sectionId] of Object.entries(navButtons)){
  document.getElementById(buttonId).addEventListener("click", () => {
    showSection(sectionId);
    if (sectionId === "listSection") {
    loadStudents();
 }
  });
}



function updateDashboardStats(){
  document.getElementById("totalStudents").innerText = students.length;

  const uniqueCourses = new Set(students.map(student => student.course));
  document.getElementById("totalCourses").innerText = uniqueCourses.size;
}

function renderStudentTable(){
  const tableBody = document.getElementById("studentTable");

  tableBody.innerHTML = students.map(student => `
    <tr>
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.age}</td>
      <td>${student.course}</td>
      <td>${student.email}</td>
    </tr>
  `).join("");
}


function loadStudents(){

    fetch("/students")

    .then(response => response.json())

    .then(data => {

        students = data;

        updateDashboardStats();

        renderStudentTable();

    })

    .catch(error => {

        console.log(error);

    });

}

addForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const newStudent = {
        id: document.getElementById("studentId").value.trim(),
        name: document.getElementById("studentName").value.trim(),
        age: document.getElementById("studentAge").value.trim(),
        course: document.getElementById("studentCourse").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
    };

    const hasEmptyField = Object.values(newStudent).some(value => value === "");
    if (hasEmptyField) {
        alert("Please fill all fields.");
        return;
    }

    // ⬇️ Replace only this fetch block
    fetch("/students", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newStudent)
    })
    .then(response => response.json())
    .then(data => {

        if (data.success) {

            alert(data.message);

            addForm.reset();

            loadStudents();

        } else {

            alert(data.message);

        }

    })
    .catch(error => {

        console.log(error);

    });

});

searchInput.addEventListener("keyup", function () {

    const id = searchInput.value.trim();

    if (id === "") {
        searchResult.innerHTML = "";
        return;
    }

    fetch(`/students/${id}`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Student Not Found");
            }

            return response.json();

        })

        .then(student => {

            searchResult.innerHTML = `
                <p><b>ID:</b> ${student.id}</p>
                <p><b>Name:</b> ${student.name}</p>
                <p><b>Age:</b> ${student.age}</p>
                <p><b>Course:</b> ${student.course}</p>
                <p><b>Email:</b> ${student.email}</p>
            `;

        })

        .catch(() => {

            searchResult.innerHTML = "<p>No matching student found.</p>";

        });

});
deleteBtn.addEventListener("click", function () {

    const id = document.getElementById("deleteId").value.trim();

    fetch(`/students/${id}`, {

        method: "DELETE"

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        document.getElementById("deleteId").value = "";

        loadStudents();

    })

    .catch(error => console.log(error));

});
findStudentBtn.addEventListener("click", function () {

    const id = document.getElementById("updateId").value.trim();

    fetch(`/students/${id}`)

    .then(response => {

        if (!response.ok) {
            throw new Error();
        }

        return response.json();

    })

    .then(student => {

        document.getElementById("updateName").value = student.name;
        document.getElementById("updateAge").value = student.age;
        document.getElementById("updateCourse").value = student.course;
        document.getElementById("updateEmail").value = student.email;

    })

    .catch(() => {

        alert("Student Not Found");

    });

});

updateForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const id = document.getElementById("updateId").value.trim();

    const updatedStudent = {

        name: document.getElementById("updateName").value.trim(),
        age: document.getElementById("updateAge").value.trim(),
        course: document.getElementById("updateCourse").value.trim(),
        email: document.getElementById("updateEmail").value.trim()

    };

    fetch(`/students/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(updatedStudent)

    })

    .then(response => response.json())

    .then(data => {

        alert(data.message);

        loadStudents();

    })

    .catch(error => console.log(error));

});





loadStudents();

document.getElementById("logoutBtn").addEventListener("click", function(){

    localStorage.removeItem("teacherLoggedIn");

    window.location.href = "teacher-login.html";

});