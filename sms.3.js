const dashboardBtn = document.getElementById("dashboardBtn");
const addStudentBtn = document.getElementById("addStudentBtn");
const updateStudentBtn = document.getElementById("updateStudentBtn");
const searchStudentBtn = document.getElementById("searchStudentBtn");
const deleteStudentBtn = document.getElementById("deleteStudentBtn");
const studentListBtn = document.getElementById("studentListBtn");

const dashboardSection = document.getElementById("dashboardSection");
const addSection = document.getElementById("addSection");
const updateSection = document.getElementById("updateSection");
const searchSection = document.getElementById("searchSection");
const deleteSection = document.getElementById("deleteSection");
const listSection = document.getElementById("listSection");

const addForm = document.getElementById("addForm");
const updateForm = document.getElementById("updateForm");

let students = [];
function hideSections(){

    dashboardSection.classList.add("hide");
    addSection.classList.add("hide");
    updateSection.classList.add("hide");
    searchSection.classList.add("hide");
    deleteSection.classList.add("hide");
    listSection.classList.add("hide");

}
dashboardBtn.addEventListener("click",function(){

    hideSections();
    dashboardSection.classList.remove("hide");

});

addStudentBtn.addEventListener("click",function(){

    hideSections();
    addSection.classList.remove("hide");

});

updateStudentBtn.addEventListener("click",function(){

    hideSections();
    updateSection.classList.remove("hide");

});

searchStudentBtn.addEventListener("click",function(){

    hideSections();
    searchSection.classList.remove("hide");

});

deleteStudentBtn.addEventListener("click",function(){

    hideSections();
    deleteSection.classList.remove("hide");

});

studentListBtn.addEventListener("click",function(){

    hideSections();
    listSection.classList.remove("hide");

    displayStudents();

});
addForm.addEventListener("submit",function(event){

    event.preventDefault();

    const student={

        id:document.getElementById("studentId").value,

        name:document.getElementById("studentName").value,

        age:document.getElementById("studentAge").value,

        course:document.getElementById("studentCourse").value,

        email:document.getElementById("studentEmail").value

    };
    if(
    student.id=="" ||
    student.name=="" ||
    student.age=="" ||
    student.course=="" ||
    student.email==""
){

    alert("Please fill all fields.");
    return;
}

    students.push(student);

    saveData();

    displayStudents();

    updateDashboard();

    addForm.reset();

});
function displayStudents(){

    const table=document.getElementById("studentTable");

    table.innerHTML="";

    for(let i=0;i<students.length;i++){

        table.innerHTML+=`

        <tr>

        <td>${students[i].id}</td>

        <td>${students[i].name}</td>

        <td>${students[i].age}</td>

        <td>${students[i].course}</td>

        <td>${students[i].email}</td>

        </tr>

        `;

    }

}
function updateDashboard(){

    document.getElementById("totalStudents").innerText=students.length;

    let courses=[];

    for(let i=0;i<students.length;i++){

        if(!courses.includes(students[i].course)){

            courses.push(students[i].course);

        }

    }

    document.getElementById("totalCourses").innerText=courses.length;

}
function saveData(){

    localStorage.setItem("students",JSON.stringify(students));

}
function loadData(){

    const data=localStorage.getItem("students");

    if(data){

        students=JSON.parse(data);

    }

    displayStudents();

    updateDashboard();

}
const searchInput=document.getElementById("searchInput");
const searchResult=document.getElementById("searchResult");

searchInput.addEventListener("keyup",function(){

    let value=searchInput.value.toLowerCase();

    searchResult.innerHTML="";

    for(let i=0;i<students.length;i++){

        if(

            String(students[i].id).toLowerCase().includes(value) ||

            students[i].name.toLowerCase().includes(value)

        ){

            searchResult.innerHTML=`

            <p><b>ID:</b> ${students[i].id}</p>

            <p><b>Name:</b> ${students[i].name}</p>

            <p><b>Age:</b> ${students[i].age}</p>

            <p><b>Course:</b> ${students[i].course}</p>

            <p><b>Email:</b> ${students[i].email}</p>

            `;

            break;

        }

    }

});
const deleteBtn=document.getElementById("deleteBtn");

deleteBtn.addEventListener("click",function(){

    const id=document.getElementById("deleteId").value;

    for(let i=0;i<students.length;i++){

        if(students[i].id==id){

            students.splice(i,1);

            break;

        }

    }

    saveData();

    displayStudents();

    updateDashboard();

    alert("Student Deleted");

});
const findStudent=document.getElementById("findStudent");

findStudent.addEventListener("click",function(){

    const id=document.getElementById("updateId").value;

    for(let i=0;i<students.length;i++){

        if(students[i].id==id){

            document.getElementById("updateName").value=students[i].name;

            document.getElementById("updateAge").value=students[i].age;

            document.getElementById("updateCourse").value=students[i].course;

            document.getElementById("updateEmail").value=students[i].email;

            return;

        }

    }

    alert("Student Not Found");

});
updateForm.addEventListener("submit",function(event){

    event.preventDefault();

    const id=document.getElementById("updateId").value;

    for(let i=0;i<students.length;i++){

        if(students[i].id==id){

            students[i].name=document.getElementById("updateName").value;

            students[i].age=document.getElementById("updateAge").value;

            students[i].course=document.getElementById("updateCourse").value;

            students[i].email=document.getElementById("updateEmail").value;

            break;

        }

    }

    saveData();

    displayStudents();

    updateDashboard();

    alert("Student Updated");

});
loadData();