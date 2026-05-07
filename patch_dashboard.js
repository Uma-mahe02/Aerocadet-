const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'public', 'js', 'dashboard.js');
let content = fs.readFileSync(targetFile, 'utf8');

// Replacements
content = content.replace(
    /SELECT DATE:<\/label>\s*<input type="date" id="attendanceDate"/,
    `SESSION TYPE:</label>
                <select id="attendanceSession" onchange="fetchAttendanceForDate()" style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 170px; color: var(--text-dark); font-weight: 600;">
                    <option value="Daily Class">Daily Class</option>
                    <option value="Saturday Parade">Saturday Parade</option>
                </select>
                <label style="font-weight: 700; color: var(--iaf-blue); font-size: 0.8rem; margin-left: 1rem;">SELECT DATE:</label>
                <input type="date" id="attendanceDate"`
);

content = content.replace(
    /const selectedDate = document\.getElementById\('attendanceDate'\)\.value;\s*if \(!selectedDate\) return;\s*\/\/\s*Fetch all cadets/g,
    `const selectedDate = document.getElementById('attendanceDate').value;
    const sessionType = document.getElementById('attendanceSession')?.value || 'Daily Class';
    if (!selectedDate) return;

    // Fetch all cadets`
);

content = content.replace(
    /apiFetch\('\/attendance\/' \+ selectedDate\);/g,
    `apiFetch('/attendance/' + selectedDate + '/' + encodeURIComponent(sessionType));`
);

content = content.replace(
    /const selectedDate = document\.getElementById\('attendanceDate'\)\.value;\s*if \(!selectedDate\) return alert\("Please select a date first\."\);/g,
    `const selectedDate = document.getElementById('attendanceDate').value;
    const sessionType = document.getElementById('attendanceSession')?.value || 'Daily Class';
    if (!selectedDate) return alert("Please select a date first.");`
);

content = content.replace(
    /JSON\.stringify\(\{ date: selectedDate, records: payloadRecords \}\)/g,
    `JSON.stringify({ date: selectedDate, session_type: sessionType, records: payloadRecords })`
);

fs.writeFileSync(targetFile, content, 'utf8');
console.log('dashboard.js updated successfully via script.');
