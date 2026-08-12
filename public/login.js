const loginForm = document.getElementById("loginForm");

document.getElementById("showPassword").addEventListener("change", function() {
    const passwordInput = document.getElementById("password");
    if (this.checked) {
        passwordInput.type = "text";
    } else {
        passwordInput.type = "password";
    }
});

loginForm.addEventListener("submit",function(event){

    event.preventDefault();

    const username = document
        .getElementById("username")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value
        .trim();

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = "sms.1.html";
        } else {
            document.getElementById("error").innerText = data.message || "Invalid Username or Password";
        }
    })
    .catch(error => {
        document.getElementById("error").innerText = "An error occurred. Please try again.";
        console.error("Login error:", error);
    });

});