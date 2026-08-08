const loginForm = document.getElementById("loginForm");

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

    if(username === "teacher" && password === "12345"){

        localStorage.setItem("teacherLoggedIn","true");

        window.location.href = "sms.1.html";
    }
    else{

        document.getElementById("error").innerText =
        "Invalid Username or Password";
    }

});