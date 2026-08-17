const signupForm = document.getElementById("signupForm");
const showPassword = document.getElementById("showPassword");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error");

// Toggle password visibility
showPassword.addEventListener("change", function() {
    if (this.checked) {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});

// Handle Sign Up
signupForm.addEventListener("submit", function(event) {
    event.preventDefault();
    
    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();
    const inviteCode = document.getElementById("inviteCode").value.trim();

    fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password, inviteCode })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.href = "login.sms.html";
        } else {
            errorMsg.innerText = data.message;
        }
    })
    .catch(error => {
        errorMsg.innerText = "Error connecting to server";
        console.error("Error:", error);
    });
});
