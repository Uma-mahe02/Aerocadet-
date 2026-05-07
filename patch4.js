const fs = require('fs');
const path = require('path');

const jsPath = 'c:\\Users\\admin\\Desktop\\ncc\\public\\js\\dashboard.js';
const serverPath = 'c:\\Users\\admin\\Desktop\\ncc\\server.js';

// 1. Mount Server Route
let serverContent = fs.readFileSync(serverPath, 'utf8');
serverContent = serverContent.replace(
    "app.use('/api/pt', require('./routes/ptRoutes'));",
    "app.use('/api/pt', require('./routes/ptRoutes'));\napp.use('/api/gallery', require('./routes/galleryRoutes'));"
);
fs.writeFileSync(serverPath, serverContent);

// 2. Inject JS Router
let jsContent = fs.readFileSync(jsPath, 'utf8');
jsContent = jsContent.replace(
    "case 'my-pt': renderMyPT(); break;",
    "case 'my-pt': renderMyPT(); break;\n        case 'gallery': renderGallery(); break;"
);

// 3. Inject JS Logic
const newCode = `

async function renderGallery() {
    const container = document.getElementById('dynamicContent');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Quick load state
    container.innerHTML = '<p>Loading Squadron Gallery...</p>';
    
    let photos = [];
    try { photos = await apiFetch('/gallery'); } catch(e) {}

    let uploadSection = '';
    if (user.role === 'Admin' || user.role === 'CTO') {
        uploadSection = \`
            <div class="glass-card" style="background: white; margin-bottom: 2rem;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Upload Operations Photo</h3>
                <form id="galleryUploadForm" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                    <div class="form-group" style="flex: 1; min-width: 200px;">
                        <label>Mission / Event Title</label>
                        <input type="text" id="galTitle" placeholder="e.g. Republic Day Parade 2026" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 200px;">
                        <label>Select Image File</label>
                        <input type="file" id="galFile" accept="image/*" style="width: 100%; padding: 0.65rem 0;">
                    </div>
                    <div class="form-group" style="flex: 2; min-width: 250px;">
                        <label>Description (Optional)</label>
                        <input type="text" id="galDesc" placeholder="Brief description of the snapshot" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                    <button type="button" class="btn btn-primary" style="padding: 0.9rem 2rem; border-radius: 8px; background: var(--iaf-blue); color: white;" onclick="submitGalleryPhoto()">UPLOAD TO ARCHIVE</button>
                </form>
            </div>
        \`;
    }

    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">SQUADRON PHOTO ARCHIVE</p>
        </div>

        \${uploadSection}

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;" id="galleryGrid">
            \${photos.length === 0 ? '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 2rem;">No operational photos uploaded to the gallery yet.</p>' : \`
                \${photos.map(p => \`
                    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                        <div style="height: 200px; overflow: hidden; position: relative; background: #f1f5f9;">
                            <img src="\${p.image_url}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" alt="\${p.title}">
                            \${(user.role === 'Admin' || user.role === 'CTO') ? \`<button onclick="deleteGalleryPhoto(\${p.id})" style="position: absolute; top: 10px; right: 10px; background: rgba(239, 68, 68, 0.9); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 5px; cursor: pointer; font-size: 0.7rem; font-weight: 800;">DELETE</button>\` : ''}
                        </div>
                        <div style="padding: 1.5rem;">
                            <h4 style="color: var(--iaf-blue); margin-bottom: 0.5rem; font-size: 1.1rem; line-height: 1.3;">\${p.title}</h4>
                            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1rem;">\${p.description || ''}</p>
                            <p style="color: #94a3b8; font-size: 0.75rem; font-weight: 600;">\${new Date(p.uploaded_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                \`).join('')}
            \`}
        </div>
    \`;
}

async function submitGalleryPhoto() {
    const title = document.getElementById('galTitle').value;
    const desc = document.getElementById('galDesc').value;
    const fileInput = document.getElementById('galFile');

    if (!title) return alert('Please enter a title for the photo.');
    if (fileInput.files.length === 0) return alert('Please select an image file to upload.');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', desc);
    formData.append('photo', fileInput.files[0]);

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/gallery/upload', { 
            method: 'POST', 
            headers: { 'Authorization': \`Bearer \${token}\` }, 
            body: formData 
        });
        
        const res = await response.json();
        if (!response.ok) throw new Error(res.message);
        
        alert('Photo uploaded successfully!');
        renderGallery();
    } catch(e) {
        alert('Upload failed: ' + e.message);
    }
}

async function deleteGalleryPhoto(id) {
    if (!confirm('Are you certain you want to delete this photo from the squadron archive?')) return;
    try {
        await apiFetch(\`/gallery/\${id}\`, { method: 'DELETE' });
        renderGallery();
    } catch(e) { alert('Failed to delete photo.'); }
}

// Map Globally
window.submitGalleryPhoto = submitGalleryPhoto;
window.deleteGalleryPhoto = deleteGalleryPhoto;

`;

fs.writeFileSync(jsPath, jsContent + newCode);
console.log("Appended Gallery UI code");
