const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'public', 'js', 'dashboard.js');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add to the switch statement in loadView
if (!content.includes("case 'materials': renderStudyMaterials(); break;")) {
    content = content.replace(
        /case 'documents': renderDocuments\(\); break;/,
        `case 'documents': renderDocuments(); break;\n        case 'materials': renderStudyMaterials(); break;`
    );
}

// 2. Add the renderStudyMaterials and uploadStudyMaterial functions
if (!content.includes("async function renderStudyMaterials()")) {
    const newUI = `

async function renderStudyMaterials() {
    const userRole = JSON.parse(localStorage.getItem('user')).role;
    const materials = await apiFetch('/study-materials');
    const container = document.getElementById('dynamicContent');
    
    let html = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">SQUADRON STUDY MATERIALS & NOTES</p>
        </div>
    \`;

    if (userRole !== 'Student') {
        html += \`
            <div class="glass-card" style="background:white; margin-bottom: 2rem;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem; font-size: 1.1rem; letter-spacing: 1px;">UPLOAD NEW STUDY MATERIAL</h3>
                <form id="studyUploadForm" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: end;">
                    <div class="form-group" style="margin: 0;">
                        <label>Material Title / Topic</label>
                        <input type="text" id="studyTitle" placeholder="e.g. Aero Engines Chapter 2" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                    </div>
                    <div class="form-group" style="margin: 0;">
                        <label>Select PDF Document</label>
                        <input type="file" id="studyFile" accept=".pdf" style="padding: 0.5rem 0; width: 100%;">
                    </div>
                    <button type="button" class="btn btn-primary" style="height: 48px; padding: 0 2rem; border-radius: 8px;" onclick="uploadStudyMaterial()">UPLOAD TO DATABASE</button>
                </form>
            </div>
        \`;
    }

    html += \`<div id="studyList" style="display: flex; flex-direction: column; gap: 1rem;">\`;

    html += materials.length ? materials.map(m => \`
        <div class="stat-card" style="background: white; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--iaf-saffron);">
            <div>
                <p style="font-weight: 800; color: var(--iaf-blue); font-size: 1.1rem;">\${m.title}</p>
                <p style="font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 5px;">
                    UPLOADED BY: \${m.uploader_name ? m.uploader_name.toUpperCase() : 'ADMIN'} | DATE: \${new Date(m.created_at).toLocaleDateString()}
                </p>
            </div>
            <div style="display: flex; gap: 1rem;">
                <a href="\${m.file_path}" target="_blank" class="btn btn-accent" style="padding: 0.5rem 1.5rem; border-radius: 6px;">DOWNLOAD PDF</a>
                \${userRole !== 'Student' ? \`<button class="btn" style="background: #fee2e2; color: #b91c1c; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;" onclick="deleteStudyMaterial(\${m.id})">DELETE</button>\` : ''}
            </div>
        </div>\`).join('') : '<div class="glass-card" style="text-align: center; color: #64748b;">No study materials available at the moment.</div>';

    html += \`</div>\`;
    container.innerHTML = html;
}

async function uploadStudyMaterial() {
    const title = document.getElementById('studyTitle').value;
    const fileInput = document.getElementById('studyFile');
    
    if (!title) return alert("Please enter a title for the material.");
    if (!fileInput.files[0]) return alert("Please select a file to upload.");

    const formData = new FormData();
    formData.append('title', title);
    formData.append('document', fileInput.files[0]);

    try {
        const response = await fetch('/api/study-materials', {
            method: 'POST',
            headers: { 'Authorization': \`Bearer \${localStorage.getItem('token')}\` },
            body: formData
        });
        const res = await response.json();
        alert(res.message || "Material uploaded!");
        renderStudyMaterials();
    } catch (e) {
        alert("Upload failed.");
    }
}

async function deleteStudyMaterial(id) {
    if(!confirm("Are you sure you want to delete this study material permanently?")) return;
    try {
        const res = await apiFetch(\`/study-materials/\${id}\`, { method: 'DELETE' });
        alert(res.message || "Deleted!");
        renderStudyMaterials();
    } catch (e) {
        alert("Delete failed.");
    }
}
`;
    content += newUI;
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('dashboard.js patched successfully for Study Materials.');
