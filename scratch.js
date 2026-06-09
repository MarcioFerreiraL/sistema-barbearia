const http = require('http');

async function test() {
  // 1. Login
  const loginRes = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin2@gmail.com", password: "123456" })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  
  if (!token) {
    console.log("No token:", loginData);
    return;
  }

  // 2. Create Service
  const res = await fetch("http://localhost:8080/api/services", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      name: "Teste Servico",
      description: "Teste",
      price: 50.0,
      durationInMinutes: 30
    })
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}

test();
