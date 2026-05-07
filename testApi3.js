async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "admin1881", password: "1881" })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;

        const headers = { 'Authorization': `Bearer ${token}` };

        const r1 = await fetch('http://localhost:5000/api/inventory/issued', {headers});
        console.log("Issued Status:", r1.status);
        console.log("Issued Data:", await r1.text());
        
    } catch(e) {
        console.error("Error:", e);
    }
}
test();
