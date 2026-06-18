const http = require('http');

async function test() {
  const loginRes = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin2@gmail.com", password: "123456" })
  });
  const token = (await loginRes.json()).token;

  const payload = {
    name: "Corte + Barba",
    description: "Corte mais barba.",
    price: parseFloat("70"),
    durationInMinutes: parseInt("50", 10)
  };

  const res = await fetch("http://localhost:8080/api/services", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}

test();
