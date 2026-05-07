async function checkApi() {
    // 1. Get token by logging in as admin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'ADMIN1881', password: 'ayhq eror xdyx guxz' })
    });
    const loginData = await loginRes.json();
    console.log("Login OK:", !!loginData.token);

    if (!loginData.token) return;

    const token = loginData.token;

    // 2. Fetch /cadets/all
    const cadetsRes = await fetch('http://localhost:5000/api/cadets/all', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const cadetsData = await cadetsRes.json();
    console.log("Cadets Array Layout:", Array.isArray(cadetsData) ? cadetsData.length : cadetsData);

    // 3. Fetch /attendance/2026-03-14
    const attRes = await fetch('http://localhost:5000/api/attendance/2026-03-14', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const attText = await attRes.text();
    console.log("Attendance API exact response text:", attText);
    try {
        console.log("Attendance JSON Length:", JSON.parse(attText).length);
    } catch(e) {
        console.log("JSON Parse Error on attendance");
    }

}

checkApi();
