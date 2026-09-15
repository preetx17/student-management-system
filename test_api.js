async function test() {
    // 1. Login
    const loginRes = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: "teacher", password: "123" }) // assuming password is 123 from db check if it fails
    });
    
    // We need the cookie
    const cookie = loginRes.headers.get("set-cookie");
    
    // 2. Update Student 101 with removePhoto=true
    const boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    const body = 
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="name"\r\n\r\n` +
        `Alice Smith\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="age"\r\n\r\n` +
        `19\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="course"\r\n\r\n` +
        `computer science\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="email"\r\n\r\n` +
        `alice.smith@example.com\r\n` +
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="removePhoto"\r\n\r\n` +
        `true\r\n` +
        `--${boundary}--\r\n`;

    const updateRes = await fetch("http://localhost:3000/students/101", {
        method: "PUT",
        headers: {
            "Content-Type": `multipart/form-data; boundary=${boundary}`,
            "Cookie": cookie
        },
        body: body
    });

    const data = await updateRes.text();
    console.log("Update Response:", data);
}

test();
