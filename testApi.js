async function test() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: "admin1881", password: "1881" })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Got token.");

        const res = await fetch('http://localhost:5000/api/inventory/add', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ item_name: "Rifle 2mm Test API", quantity: "1" })
        });
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch(e) {
        console.error("Error:", e);
    }
}
test();
