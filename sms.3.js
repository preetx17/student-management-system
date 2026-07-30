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
    console.log("Dashboard clicked");
    hideSections();
    dashboardSection.classList.remove("hide");
});
addStudentBtn.addEventListener("click",function(){
    console.log("add clicked");
    hideSections();

    addSection.classList.remove("hide");

});
updateStudentBtn.addEventListener("click",function(){
    console.log("update clicked");
    hideSections();

    updateSection.classList.remove("hide");

});
searchStudentBtn.addEventListener("click",function(){
    console.log("search clicked");
    hideSections();
    searchSection.classList.remove("hide");

});
deleteStudentBtn.addEventListener("click",function(){
    console.log("delete clicked");
    hideSections();
    deleteSection.classList.remove("hide");
});
studentListBtn.addEventListener("click",function(){
    console.log("student list clicked");
    hideSections();
    listSection.classList.remove("hide");
    displayStudent();
});
const addForm=document.getElementById("addForm");

addForm.addEventListener("submit",function(event){

    event.preventDefault();

    const student={

        id:document.getElementById("studentId").value,

        name:document.getElementById("studentName").value,

        age:document.getElementById("studentAge").value,

        course:document.getElementById("studentCourse").value,

        email:document.getElementById("studentEmail").value

    };

    students.push(student);

    saveData();

    displayStudents();

    addForm.reset();

});