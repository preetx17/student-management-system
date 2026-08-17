const addForm = document.getElementById("addForm");
const updateForm = document.getElementById("updateForm");
const searchInput = document.getElementById("searchInput");
const findStudentBtn = document.getElementById("findStudent");
const deleteBtn = document.getElementById("deleteBtn");
const searchResult = document.getElementById("searchResult");
const logoutBtn = document.getElementById("logoutBtn");

// Teacher Profile Elements
const profileTrigger = document.getElementById("profileTrigger");
const profileDropdown = document.getElementById("profileDropdown");
const topTeacherPhoto = document.getElementById("topTeacherPhoto");
const topTeacherName = document.getElementById("topTeacherName");
const dropdownTeacherPhoto = document.getElementById("dropdownTeacherPhoto");
const dropdownTeacherName = document.getElementById("dropdownTeacherName");
const dropdownTeacherDept = document.getElementById("dropdownTeacherDept");
const dropdownTeacherAge = document.getElementById("dropdownTeacherAge");
const editProfileBtn = document.getElementById("editProfileBtn");
const adminSettingsBtn = document.getElementById("adminSettingsBtn");

// Modals
const editProfileModal = document.getElementById("editProfileModal");
const closeProfileModal = document.getElementById("closeProfileModal");
const editProfileForm = document.getElementById("editProfileForm");

const adminSettingsModal = document.getElementById("adminSettingsModal");
const closeAdminSettingsModal = document.getElementById("closeAdminSettingsModal");
const adminSettingsForm = document.getElementById("adminSettingsForm");
const currentInviteCode = document.getElementById("currentInviteCode");

const studentDetailsModal = document.getElementById("studentDetailsModal");
const closeStudentModal = document.getElementById("closeStudentModal");
const studentDetailsContent = document.getElementById("studentDetailsContent");
const addStudentImageSection = document.getElementById("addStudentImageSection");
const quickAddPhotoBtn = document.getElementById("quickAddPhotoBtn");

let students = [];
let currentViewingStudentId = null;

// Authentication & Profile Check
function checkAuthAndRole() {
    fetch("/check-auth")
        .then(res => {
            if (!res.ok) window.location.href = "login.sms.html";
            return res.json();
        })
        .then(data => {
            if (data.authenticated) {
                if (data.role === 'owner') {
                    adminSettingsBtn.classList.remove("hide");
                }
            } else {
                window.location.href = "login.sms.html";
            }
        });
}
checkAuthAndRole();

function loadTeacherProfile() {
    fetch("/api/teacher/profile")
        .then(response => {
            if (!response.ok) return;
            return response.json();
        })
        .then(data => {
            if (data.success && data.profile) {
                const p = data.profile;
                const photoSrc = p.photo ? p.photo : "https://via.placeholder.com/60";
                
                topTeacherPhoto.src = photoSrc;
                dropdownTeacherPhoto.src = photoSrc;
                
                topTeacherName.innerText = p.name || p.username;
                dropdownTeacherName.innerText = p.name || p.username;
                dropdownTeacherDept.innerText = p.department || "No Department";
                dropdownTeacherAge.innerText = `Age: ${p.age || "-"}`;

                // Populate edit form
                document.getElementById("profUsername").value = p.username;
                document.getElementById("profName").value = p.name || "";
                document.getElementById("profAge").value = p.age || "";
                document.getElementById("profDept").value = p.department || "";
            }
        })
        .catch(() => window.location.href = "login.sms.html");
}

loadTeacherProfile();

// Profile Dropdown Toggle
profileTrigger.addEventListener("click", () => {
    profileDropdown.classList.toggle("show");
});
document.addEventListener("click", (e) => {
    if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove("show");
    }
});

// Edit Profile Modal
editProfileBtn.addEventListener("click", () => {
    profileDropdown.classList.remove("show");
    editProfileModal.classList.remove("hide");
});
closeProfileModal.addEventListener("click", () => editProfileModal.classList.add("hide"));

editProfileForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("newUsername", document.getElementById("profUsername").value.trim());
    
    const newPassword = document.getElementById("profPassword").value.trim();
    if (newPassword) formData.append("newPassword", newPassword);
    
    formData.append("name", document.getElementById("profName").value.trim());
    formData.append("age", document.getElementById("profAge").value.trim());
    formData.append("department", document.getElementById("profDept").value.trim());
    
    const photoFile = document.getElementById("profPhoto").files[0];
    if (photoFile) formData.append("photo", photoFile);

    fetch("/api/teacher/profile", {
        method: "PUT",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if (data.success) {
            editProfileModal.classList.add("hide");
            loadTeacherProfile();
        }
    })
    .catch(err => console.log(err));
});

// Admin Settings Modal
adminSettingsBtn.addEventListener("click", () => {
    profileDropdown.classList.remove("show");
    
    // Fetch current code
    fetch("/api/settings/invite-code")
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            currentInviteCode.value = data.inviteCode;
            adminSettingsModal.classList.remove("hide");
        } else {
            alert("Unauthorized to view invite code.");
        }
    });
});

closeAdminSettingsModal.addEventListener("click", () => adminSettingsModal.classList.add("hide"));

adminSettingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const newCode = currentInviteCode.value.trim();
    if(!newCode) return;
    
    fetch("/api/settings/invite-code", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newCode })
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.success) {
            adminSettingsModal.classList.add("hide");
        }
    })
    .catch(err => console.log(err));
});


// Tab Switching Logic
const tabBtns = document.querySelectorAll(".tab-btn");
const actionSections = document.querySelectorAll(".action-section");

tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        tabBtns.forEach(t => t.classList.remove("active"));
        actionSections.forEach(s => s.classList.add("hide"));
        btn.classList.add("active");
        const targetId = btn.getAttribute("data-target");
        document.getElementById(targetId).classList.remove("hide");
    });
});

function updateDashboardStats(){
  document.getElementById("totalStudents").innerText = students.length;
  const uniqueCourses = new Set(students.map(student => student.course));
  document.getElementById("totalCourses").innerText = uniqueCourses.size;
}

function renderStudentTable(){
  const tableBody = document.getElementById("studentTable");
  tableBody.innerHTML = students.map(student => `
    <tr onclick="openStudentDetails('${student.id}')">
      <td>
        ${student.photo ? `<img src="${student.photo}" class="student-photo-img" alt="Photo">` : `<img src="https://via.placeholder.com/40" class="student-photo-img" alt="No Photo">`}
      </td>
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
    .catch(error => console.log(error));
}

// Student Details Modal
function openStudentDetails(id) {
    const student = students.find(s => s.id.toString() === id.toString());
    if (!student) return;
    
    currentViewingStudentId = student.id;
    
    const photoSrc = student.photo ? student.photo : "https://via.placeholder.com/100";
    
    studentDetailsContent.innerHTML = `
        <img src="${photoSrc}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #3b82f6; margin-bottom: 15px;">
        <h2 style="color: #1e293b; margin-bottom: 5px;">${student.name}</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">ID: ${student.id} | ${student.course}</p>
        
        <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="margin-bottom: 8px;"><b>Age:</b> ${student.age}</p>
            <p style="margin-bottom: 8px;"><b>Email:</b> ${student.email}</p>
            <p style="margin-bottom: 0;"><b>Course:</b> ${student.course}</p>
        </div>
    `;
    
    if (!student.photo) {
        addStudentImageSection.classList.remove("hide");
    } else {
        addStudentImageSection.classList.add("hide");
    }
    
    studentDetailsModal.classList.remove("hide");
}

closeStudentModal.addEventListener("click", () => {
    studentDetailsModal.classList.add("hide");
    currentViewingStudentId = null;
});

// Quick Add Photo
quickAddPhotoBtn.addEventListener("click", () => {
    if (!currentViewingStudentId) return;
    
    const fileInput = document.getElementById("quickAddPhoto");
    if (!fileInput.files[0]) {
        alert("Please select an image first.");
        return;
    }
    
    const formData = new FormData();
    formData.append("photo", fileInput.files[0]);
    
    fetch(`/students/${currentViewingStudentId}/photo`, {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        if(data.success) {
            fileInput.value = "";
            loadStudents();
            // Automatically close or update modal
            studentDetailsModal.classList.add("hide");
        }
    })
    .catch(err => console.log(err));
});


// Autocomplete Setup
function setupAutocomplete(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const wrapper = document.createElement("div");
    wrapper.className = "autocomplete-container";
    
    const parentGroup = input.closest('.input-group');
    if(parentGroup) {
        const list = document.createElement("ul");
        list.className = "autocomplete-list hide";
        parentGroup.appendChild(list);
        
        input.addEventListener("input", function() {
            const val = this.value.trim().toLowerCase();
            list.innerHTML = "";
            
            if (!val) {
                list.classList.add("hide");
                return;
            }
            
            const matches = students.filter(s => 
                s.id.toString().toLowerCase().includes(val) || 
                s.name.toLowerCase().includes(val)
            );
            
            if (matches.length > 0) {
                matches.forEach(s => {
                    const item = document.createElement("li");
                    item.className = "autocomplete-item";
                    item.innerText = `${s.name} (ID: ${s.id})`;
                    item.addEventListener("mousedown", function(e) {
                        e.preventDefault();
                        input.value = s.id;
                        list.classList.add("hide");
                    });
                    list.appendChild(item);
                });
                list.classList.remove("hide");
            } else {
                list.classList.add("hide");
            }
        });
        
        input.addEventListener("blur", function() {
            list.classList.add("hide");
        });
        
        input.addEventListener("focus", function() {
            if (this.value.trim().length > 0 && list.children.length > 0) {
                list.classList.remove("hide");
            }
        });
    }
}

setupAutocomplete("updateId");
setupAutocomplete("deleteId");


// Add Student
addForm.addEventListener("submit", function(event) {
    event.preventDefault();
    const formData = new FormData();
    
    formData.append("id", document.getElementById("studentId").value.trim());
    formData.append("name", document.getElementById("studentName").value.trim());
    formData.append("age", document.getElementById("studentAge").value.trim());
    formData.append("course", document.getElementById("studentCourse").value.trim());
    formData.append("email", document.getElementById("studentEmail").value.trim());
    
    const photoFile = document.getElementById("studentPhoto").files[0];
    if (photoFile) {
        formData.append("photo", photoFile);
    }

    fetch("/students", {
        method: "POST",
        body: formData
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
    .catch(error => console.log(error));
});

// Search Student (Scrollable Results with Clickable Cards)
searchInput.addEventListener("input", function () {
    const val = searchInput.value.trim().toLowerCase();
    
    if (val === "") {
        searchResult.classList.add("hide");
        searchResult.innerHTML = "";
        return;
    }

    const matches = students.filter(s => s.id.toString().includes(val) || s.name.toLowerCase().includes(val));

    if (matches.length > 0) {
        searchResult.innerHTML = `
            <div style="max-height: 350px; overflow-y: auto; padding-right: 10px;">
                ${matches.map(matched => `
                    <div onclick="openStudentDetails('${matched.id}')" style="cursor: pointer; background: #ffffff; padding: 15px; border-radius: 12px; margin-bottom: 10px; border: 1px solid #e2e8f0; transition: background 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div style="display: flex; gap: 15px; align-items: center;">
                            ${matched.photo ? `<img src="${matched.photo}" alt="Photo" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0;">` : `<img src="https://via.placeholder.com/50" alt="No Photo" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #e2e8f0;">`}
                            <div>
                                <p style="margin-bottom: 3px; color: #64748b; font-size: 13px;"><b>ID:</b> ${matched.id}</p>
                                <p style="margin-bottom: 3px; color: #1e293b; font-size: 15px; font-weight: 600;">${matched.name}</p>
                                <p style="margin-bottom: 0; color: #475569; font-size: 12px;">${matched.course}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        searchResult.classList.remove("hide");
    } else {
        searchResult.innerHTML = "<p style='color: #64748b;'>No matching student found.</p>";
        searchResult.classList.remove("hide");
    }
});

// Delete Student
deleteBtn.addEventListener("click", function () {
    const id = document.getElementById("deleteId").value.trim();
    if(!id) return;
    
    fetch(`/students/${id}`, { method: "DELETE" })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        document.getElementById("deleteId").value = "";
        loadStudents();
    })
    .catch(error => console.log(error));
});

// Find Student for Update
findStudentBtn.addEventListener("click", function () {
    const id = document.getElementById("updateId").value.trim();
    if(!id) return;
    
    const student = students.find(s => s.id.toString() === id);
    if(student) {
        document.getElementById("updateNewId").value = student.id;
        document.getElementById("updateName").value = student.name;
        document.getElementById("updateAge").value = student.age;
        document.getElementById("updateCourse").value = student.course;
        document.getElementById("updateEmail").value = student.email;
        updateForm.classList.remove("hide");
    } else {
        alert("Student Not Found in local data");
        updateForm.classList.add("hide");
    }
});

// Update Student
updateForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const id = document.getElementById("updateId").value.trim();
    const formData = new FormData();
    
    formData.append("newId", document.getElementById("updateNewId").value.trim());
    formData.append("name", document.getElementById("updateName").value.trim());
    formData.append("age", document.getElementById("updateAge").value.trim());
    formData.append("course", document.getElementById("updateCourse").value.trim());
    formData.append("email", document.getElementById("updateEmail").value.trim());
    
    const photoFile = document.getElementById("updatePhoto").files[0];
    if (photoFile) {
        formData.append("photo", photoFile);
    }

    fetch(`/students/${id}`, {
        method: "PUT",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadStudents();
        updateForm.classList.add("hide");
    })
    .catch(error => console.log(error));
});

// Logout
logoutBtn.addEventListener("click", function(){
    fetch("/logout", { method: "POST" })
    .then(() => {
        window.location.href = "login.sms.html";
    })
    .catch(err => console.error("Logout failed", err));
});

// Initial load
loadStudents();