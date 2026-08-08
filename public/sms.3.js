
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
    if (sectionId === "listSection") renderStudentTable();
  });
}

function findStudentIndexById(id){
  return students.findIndex(student => student.id === id);
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


function saveToStorage(){
  localStorage.setItem("students", JSON.stringify(students));
}

function loadFromStorage(){
  const saved = localStorage.getItem("students");
  if (saved){
    students = JSON.parse(saved);
  }
}

addForm.addEventListener("submit", function(event){
  event.preventDefault();

  const newStudent = {
    id:     document.getElementById("studentId").value.trim(),
    name:   document.getElementById("studentName").value.trim(),
    age:    document.getElementById("studentAge").value.trim(),
    course: document.getElementById("studentCourse").value.trim(),
    email:  document.getElementById("studentEmail").value.trim(),
  };

  const hasEmptyField = Object.values(newStudent).some(value => value === "");
  if (hasEmptyField){
    alert("Please fill all fields.");
    return;
  }

  students.push(newStudent);
  saveToStorage();
  updateDashboardStats();
  addForm.reset();
  alert("Student added.");
});



searchInput.addEventListener("keyup", function(){
  const query = searchInput.value.trim().toLowerCase();

  if (query === ""){
    searchResult.innerHTML = "";
    return;
  }

  const match = students.find(student =>
    student.id.toLowerCase().includes(query) ||
    student.name.toLowerCase().includes(query)
  );

  searchResult.innerHTML = match
    ? `
      <p><b>ID:</b> ${match.id}</p>
      <p><b>Name:</b> ${match.name}</p>
      <p><b>Age:</b> ${match.age}</p>
      <p><b>Course:</b> ${match.course}</p>
      <p><b>Email:</b> ${match.email}</p>
    `
    : `<p>No matching student found.</p>`;
});



deleteBtn.addEventListener("click", function(){
  const id = document.getElementById("deleteId").value.trim();
  const index = findStudentIndexById(id);

  if (index === -1){
    alert("No student found with that ID.");
    return;
  }

  students.splice(index, 1);
  saveToStorage();
  updateDashboardStats();
  renderStudentTable();
  document.getElementById("deleteId").value = "";
  alert("Student deleted.");
});


findStudentBtn.addEventListener("click", function(){
  const id = document.getElementById("updateId").value.trim();
  const index = findStudentIndexById(id);

  if (index === -1){
    alert("Student Not Found");
    return;
  }

  const student = students[index];
  document.getElementById("updateName").value   = student.name;
  document.getElementById("updateAge").value    = student.age;
  document.getElementById("updateCourse").value = student.course;
  document.getElementById("updateEmail").value  = student.email;
});

updateForm.addEventListener("submit", function(event){
  event.preventDefault();

  const id = document.getElementById("updateId").value.trim();
  const index = findStudentIndexById(id);

  if (index === -1){
    alert("Find a student by ID first.");
    return;
  }

  students[index].name   = document.getElementById("updateName").value.trim();
  students[index].age    = document.getElementById("updateAge").value.trim();
  students[index].course = document.getElementById("updateCourse").value.trim();
  students[index].email  = document.getElementById("updateEmail").value.trim();

  saveToStorage();
  renderStudentTable();
  updateDashboardStats();
  alert("Student Updated");
});

loadFromStorage();
updateDashboardStats();
renderStudentTable();
document.getElementById("logoutBtn").addEventListener("click",function(){

    localStorage.removeItem("teacherLoggedIn");

    window.location.href = "teacher-login.html";

});