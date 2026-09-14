const addForm = document.getElementById("addForm");
const updateForm = document.getElementById("updateForm");
const searchInput = document.getElementById("searchInput");
const findStudentBtn = document.getElementById("findStudent");
const deleteBtn = document.getElementById("deleteBtn");
const logoutBtn = document.getElementById("logoutBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const importCsvBtn = document.getElementById("importCsvBtn");
const importCsvInput = document.getElementById("importCsvInput");

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

function escapeHTML(str) {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
let currentViewingStudentId = null;

const COURSE_MAPPING = {
    'cs': 'Computer Science',
    'eng': 'English',
    'sci': 'Science',
    'eco': 'Economics',
    'math': 'Mathematics'
};

function showToast(message, type = 'success') {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="fa-solid fa-check-circle"></i>' : '<i class="fa-solid fa-circle-exclamation"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add("show"), 10);
    
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

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
                
                if (p.course1) document.getElementById("profCourse1").value = p.course1;
                if (p.course2) document.getElementById("profCourse2").value = p.course2;
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
    formData.append("course1", document.getElementById("profCourse1").value);
    formData.append("course2", document.getElementById("profCourse2").value);
    
    const photoFile = document.getElementById("profPhoto").files[0];
    if (photoFile) formData.append("photo", photoFile);

    const submitBtn = editProfileForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
    submitBtn.disabled = true;

    fetch("/api/teacher/profile", {
        method: "PUT",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            showToast(data.message, 'success');
            editProfileModal.classList.add("hide");
            loadTeacherProfile();
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(err => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showToast("An error occurred", 'error');
        console.log(err);
    });
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
  const uniqueCourses = new Set(students.map(student => (student.course || "").toLowerCase()));
  document.getElementById("totalCourses").innerText = uniqueCourses.size;
}

function renderStudentTable(){
  const tableBody = document.getElementById("studentTable");
  
  if (students.length === 0) {
      tableBody.innerHTML = `
          <tr>
              <td colspan="6">
                  <div class="empty-state">
                      <i class="fa-solid fa-users-slash"></i>
                      <p>No students found in the database.</p>
                  </div>
              </td>
          </tr>
      `;
      return;
  }
  
  tableBody.innerHTML = students.map(student => `
    <tr onclick="openStudentDetails('${escapeHTML(student.id.toString())}')">
      <td>
        ${student.photo ? `<img src="${escapeHTML(student.photo)}" class="student-photo-img" alt="Photo">` : `<img src="https://via.placeholder.com/40" class="student-photo-img" alt="No Photo">`}
      </td>
      <td>${escapeHTML(student.id.toString())}</td>
      <td>${escapeHTML(student.name)}</td>
      <td>${escapeHTML(student.age.toString())}</td>
      <td>${escapeHTML(student.course)}</td>
      <td>${escapeHTML(student.email)}</td>
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
        loadTeachers();
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

function setupCourseExpansion(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener("blur", function() {
        const val = this.value.trim().toLowerCase();
        if (COURSE_MAPPING[val]) {
            this.value = COURSE_MAPPING[val];
        }
    });
}

setupAutocomplete("updateId");
setupAutocomplete("deleteId");
setupCourseExpansion("studentCourse");
setupCourseExpansion("updateCourse");


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

    const submitBtn = addForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
    submitBtn.disabled = true;

    fetch("/students", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            showToast(data.message, 'success');
            addForm.reset();
            loadStudents();
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showToast("Failed to add student", 'error');
        console.log(error);
    });
});

// Search Student (Scrollable Results with Clickable Cards)
searchInput.addEventListener("input", function () {
    const val = searchInput.value.trim().toLowerCase();
    
    if (val === "") {
        searchResult.classList.add("hide");
        searchResult.innerHTML = "";
        return;
    }

    const matches = students.filter(s => 
        s.id.toString().includes(val) || 
        s.name.toLowerCase().includes(val) ||
        s.course.toLowerCase().includes(val) ||
        s.email.toLowerCase().includes(val) ||
        s.age.toString().includes(val)
    );

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
        searchResult.innerHTML = `
            <div class="empty-state">
                <i class="fa-regular fa-folder-open"></i>
                <p>No matching student found.</p>
            </div>
        `;
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
        if (data.success) {
            showToast(data.message, 'success');
            document.getElementById("deleteId").value = "";
            loadStudents();
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        showToast("Delete Failed", 'error');
        console.log(error);
    });
});

// Find Student for Update
findStudentBtn.addEventListener("click", function () {
    const id = document.getElementById("updateId").value.trim();
    if(!id) return;
    
    const student = students.find(s => s.id.toString() === id);
    if(student) {
        document.getElementById("updateName").value = student.name;
        document.getElementById("updateAge").value = student.age;
        document.getElementById("updateCourse").value = student.course;
        document.getElementById("updateEmail").value = student.email;
        updateForm.classList.remove("hide");
    } else {
        showToast("Student Not Found in local data", 'error');
        updateForm.classList.add("hide");
    }
});

// Update Student
updateForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const id = document.getElementById("updateId").value.trim();
    const formData = new FormData();
    
    formData.append("name", document.getElementById("updateName").value.trim());
    formData.append("age", document.getElementById("updateAge").value.trim());
    formData.append("course", document.getElementById("updateCourse").value.trim());
    formData.append("email", document.getElementById("updateEmail").value.trim());
    
    const photoFile = document.getElementById("updatePhoto").files[0];
    if (photoFile) {
        formData.append("photo", photoFile);
    }

    const submitBtn = updateForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
    submitBtn.disabled = true;

    fetch(`/students/${id}`, {
        method: "PUT",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (data.success) {
            showToast(data.message, 'success');
            loadStudents();
            updateForm.reset();
            updateForm.classList.add("hide");
            document.getElementById("updateId").value = "";
        } else {
            showToast(data.message, 'error');
        }
    })
    .catch(error => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showToast("Update Failed", 'error');
        console.log(error);
    });
});

// Logout
logoutBtn.addEventListener("click", function(){
    fetch("/logout", { method: "POST" })
    .then(() => {
        window.location.href = "login.sms.html";
    })
    .catch(err => console.error("Logout failed", err));
});

// --- NEW VIEW LOGIC ---

let allTeachers = [];

function loadTeachers() {
    fetch("/api/teachers")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                allTeachers = data.teachers;
                renderTeacherRoster();
                renderCourseView();
            }
        })
        .catch(err => console.log(err));
}

function renderTeacherRoster() {
    const container = document.getElementById("teachersContainer");
    if (!container) return;
    
    if (allTeachers.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-user-xmark"></i><p>No teachers found.</p></div>`;
        return;
    }
    
    container.innerHTML = allTeachers.map(t => {
        const photoSrc = t.photo ? t.photo : "https://via.placeholder.com/80";
        let coursesHtml = "";
        if (t.course1) coursesHtml += `<span class="course-tag">${t.course1}</span>`;
        if (t.course2) coursesHtml += `<span class="course-tag">${t.course2}</span>`;
        if (!coursesHtml) coursesHtml = `<span style="font-size:11px;color:#94a3b8;">No assigned courses</span>`;
        
        return `
            <div class="teacher-card" onclick="openTeacherDetails('${t.id}')" style="cursor: pointer;">
                <img src="${photoSrc}" alt="${t.name || t.username}">
                <h4>${t.name || t.username}</h4>
                <p class="dept">${t.department || "General"}</p>
                <div class="courses">${coursesHtml}</div>
            </div>
        `;
    }).join("");
}

function renderCourseView() {
    const container = document.getElementById("coursesContainer");
    if (!container) return;
    
    const baseCourses = [
        "Computer Science",
        "English",
        "Science",
        "Economics",
        "Mathematics"
    ];
    
    let html = "";
    baseCourses.forEach(c => {
        const cLower = c.toLowerCase();
        const teachers = allTeachers.filter(t => 
            (t.course1 && t.course1.toLowerCase() === cLower) || 
            (t.course2 && t.course2.toLowerCase() === cLower)
        );
        
        const enrolled = students.filter(s => s.course && s.course.toLowerCase() === cLower);
        
        let teacherHtml = teachers.map(t => `
            <div class="mini-teacher-card" onclick="openTeacherDetails('${t.id}')" style="cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <img src="${t.photo ? t.photo : 'https://via.placeholder.com/30'}">
                <span>${t.name || t.username}</span>
            </div>
        `).join("");
        
        if(!teacherHtml) teacherHtml = `<p style="font-size:13px;color:#94a3b8;">No teachers assigned.</p>`;
        
        let studentHtml = "";
        if (enrolled.length > 0) {
            studentHtml = `
                <div class="course-student-table">
                    <table>
                        <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Email</th></tr></thead>
                        <tbody>
                            ${enrolled.map(s => `<tr><td>${escapeHTML(s.id.toString())}</td><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.age.toString())}</td><td>${escapeHTML(s.email)}</td></tr>`).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            studentHtml = `<p style="font-size:13px;color:#94a3b8;">No students enrolled.</p>`;
        }
        
        html += `
            <div class="course-card">
                <div class="course-header" onclick="this.parentElement.classList.toggle('open')">
                    <div class="course-title"><i class="fa-solid fa-book-bookmark"></i> ${c}</div>
                    <div class="course-stats">
                        <span><i class="fa-solid fa-chalkboard-user"></i> ${teachers.length} Teachers</span>
                        <span><i class="fa-solid fa-user-graduate"></i> ${enrolled.length} Students</span>
                        <i class="fa-solid fa-chevron-down" style="font-size:12px;"></i>
                    </div>
                </div>
                <div class="course-content">
                    <div class="course-teachers">
                        <h5>Course Instructors</h5>
                        <div class="course-teachers-list">${teacherHtml}</div>
                    </div>
                    <div class="course-students">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h5 style="margin: 0;">Enrolled Students</h5>
                            ${enrolled.length > 0 ? `<button onclick="exportCourseCsv('${c}')" style="background: #e0f2fe; color: #0284c7; border: none; padding: 5px 12px; border-radius: 6px; font-weight: 600; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: background 0.2s;"><i class="fa-solid fa-download"></i> Export</button>` : ''}
                        </div>
                        ${studentHtml}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function exportCourseCsv(courseName) {
    const cLower = courseName.toLowerCase();
    const enrolled = students.filter(s => s.course && s.course.toLowerCase() === cLower);
    
    if (enrolled.length === 0) {
        showToast("No students to export", "error");
        return;
    }

    let csvContent = "ID,Name,Age,Course,Email\n";
    enrolled.forEach(s => {
        const id = s.id.toString().replace(/"/g, '""');
        const name = s.name.replace(/"/g, '""');
        const age = s.age.toString().replace(/"/g, '""');
        const course = s.course.replace(/"/g, '""');
        const email = s.email.replace(/"/g, '""');
        csvContent += `"${id}","${name}","${age}","${course}","${email}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `${courseName.replace(/\s+/g, '_')}_roster_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`${courseName} exported successfully!`);
}

// Left Nav Logic
const navBtns = document.querySelectorAll(".left-nav .nav-btn");
const viewSections = document.querySelectorAll(".left-panel .view-section");

navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        navBtns.forEach(b => b.classList.remove("active"));
        viewSections.forEach(s => s.classList.add("hide"));
        btn.classList.add("active");
        
        const targetId = btn.getAttribute("data-view");
        document.getElementById(targetId).classList.remove("hide");
    });
});

// Teacher Details Modal Logic
const teacherDetailsModal = document.getElementById("teacherDetailsModal");
const closeTeacherModal = document.getElementById("closeTeacherModal");
const teacherDetailsContent = document.getElementById("teacherDetailsContent");

function openTeacherDetails(id) {
    const teacher = allTeachers.find(t => t.id.toString() === id.toString());
    if (!teacher) return;
    
    const photoSrc = teacher.photo ? teacher.photo : "https://via.placeholder.com/100";
    
    let coursesHtml = "";
    if (teacher.course1) coursesHtml += `<span class="course-tag" style="background:#e0f2fe;color:#0369a1;padding:4px 10px;border-radius:20px;font-size:12px;margin:2px;display:inline-block;font-weight:600;">${teacher.course1}</span>`;
    if (teacher.course2) coursesHtml += `<span class="course-tag" style="background:#e0f2fe;color:#0369a1;padding:4px 10px;border-radius:20px;font-size:12px;margin:2px;display:inline-block;font-weight:600;">${teacher.course2}</span>`;
    if (!coursesHtml) coursesHtml = `<span style="color:#94a3b8;font-size:12px;">No courses assigned</span>`;

    teacherDetailsContent.innerHTML = `
        <img src="${photoSrc}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 3px solid #3b82f6; margin-bottom: 15px;">
        <h2 style="color: #1e293b; margin-bottom: 5px;">${teacher.name || teacher.username}</h2>
        <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">@${teacher.username}</p>
        
        <div style="text-align: left; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <p style="margin-bottom: 8px; color: #334155;"><b>Department:</b> ${teacher.department || "General"}</p>
            <p style="margin-bottom: 8px; color: #334155;"><b>Age:</b> ${teacher.age || "N/A"}</p>
            <p style="margin-bottom: 8px; color: #334155;"><b>Courses:</b> <br><div style="margin-top:5px;">${coursesHtml}</div></p>
        </div>
    `;
    
    teacherDetailsModal.classList.remove("hide");
}

if (closeTeacherModal) {
    closeTeacherModal.addEventListener("click", () => {
        teacherDetailsModal.classList.add("hide");
    });
}

// Initial load
loadStudents();

// Export to CSV Feature
if (exportCsvBtn) {
    exportCsvBtn.addEventListener("click", () => {
        const table = document.getElementById("studentTable");
        const rows = table.querySelectorAll("tr");
        
        if (rows.length === 0) {
            showToast("No data to export", "error");
            return;
        }

        // CSV Header
        let csvContent = "ID,Name,Age,Course,Email\n";

        // Iterate through all visible rows and extract data
        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length >= 6) {
                // We use cells 1 to 5 because cell 0 is the Photo
                const id = cells[1].innerText.replace(/"/g, '""');
                const name = cells[2].innerText.replace(/"/g, '""');
                const age = cells[3].innerText.replace(/"/g, '""');
                const course = cells[4].innerText.replace(/"/g, '""');
                const email = cells[5].innerText.replace(/"/g, '""');
                
                csvContent += `"${id}","${name}","${age}","${course}","${email}"\n`;
            }
        });

        // Trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        
        link.setAttribute("href", url);
        link.setAttribute("download", "student_roster_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("Export successful!");
    });
}

// Bulk CSV Import Feature
if (importCsvBtn && importCsvInput) {
    importCsvBtn.addEventListener("click", () => {
        importCsvInput.click();
    });

    importCsvInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const csv = event.target.result;
            const lines = csv.split('\n');
            const students = [];

            // Start at 1 to skip the header row
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                // If it was exported by our system, it has quotes like: "101","John","20","Math","a@a.com"
                let parts = [];
                if (line.includes('","')) {
                    const cleanLine = line.replace(/(^"|"$)/g, '');
                    parts = cleanLine.split('","');
                } else {
                    parts = line.split(',');
                }
                
                if (parts.length >= 5) {
                    students.push({
                        id: parts[0].trim(),
                        name: parts[1].trim(),
                        age: parts[2].trim(),
                        course: parts[3].trim(),
                        email: parts[4].trim()
                    });
                }
            }

            if (students.length === 0) {
                showToast("No valid student data found in CSV", "error");
                importCsvInput.value = "";
                return;
            }
            
            const originalIcon = importCsvBtn.innerHTML;
            importCsvBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importing...';
            importCsvBtn.disabled = true;

            fetch("/students/bulk", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ students })
            })
            .then(res => res.json())
            .then(data => {
                importCsvBtn.innerHTML = originalIcon;
                importCsvBtn.disabled = false;
                importCsvInput.value = "";

                if (data.success) {
                    showToast(data.message, "success");
                    loadStudents(); 
                } else {
                    showToast(data.message, "error");
                }
            })
            .catch(err => {
                console.error(err);
                importCsvBtn.innerHTML = originalIcon;
                importCsvBtn.disabled = false;
                importCsvInput.value = "";
                showToast("Failed to connect to server.", "error");
            });
        };
        reader.readAsText(file);
    });
}