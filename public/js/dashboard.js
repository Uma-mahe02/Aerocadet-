const apiFetch = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(apiFetch.baseUrl + url, { ...options, headers });
    if (response.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
    return response.json();
};

apiFetch.baseUrl = '/api';

async function loadView(view) {
    const container = document.getElementById('dynamicContent');
    document.getElementById('viewTitle').innerText = view.replace('-', ' ').toUpperCase();
    container.innerHTML = '<p>Loading...</p>';

    switch (view) {
        case 'overview': renderOverview(); break;
        case 'profile': renderProfile(); break;
        case 'announcements': renderAnnouncements(); break;
        case 'camps': renderCamps(); break;
        case 'manage-camps': renderManageCamps(); break;
        case 'post-announcement': renderPostAnnouncement(); break;
        case 'manage-cadets': renderManageCadets(); break;
        case 'verify-docs': renderVerifyDocs(); break;
        case 'gen-certs': renderGenCerts(); break;
        case 'documents': renderDocuments(); break;
        case 'certificates': renderCertificates(); break;
        default: container.innerHTML = `<h3>${view} module is coming soon!</h3>`;
    }
}

async function renderOverview() {
    const user = JSON.parse(localStorage.getItem('user'));
    const container = document.getElementById('dynamicContent');
    if (user.role === 'Student') {
        const profile = await apiFetch('/cadets/profile');
        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card"><h3>Current Rank</h3><p>${profile.rank.toUpperCase()}</p></div>
                <div class="stat-card"><h3>Flight Score</h3><p>${profile.performance_score}</p></div>
                <div class="stat-card"><h3>Department</h3><p>${profile.department.toUpperCase()}</p></div>
            </div>
            <div class="glass-card glass-dark" style="margin-top: 2rem;">
                <h3 style="color: var(--iaf-sky); margin-bottom: 1rem;">MISSION BRIEFING</h3>
                <p>Jai Hind, Cadet ${profile.name}! Your status is currently active. Ensure your flight logbooks are updated and check the latest mission orders below.</p>
                <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                    <button class="btn btn-accent" onclick="loadView('announcements')">VIEW ORDERS</button>
                    <button class="btn btn-primary" style="border: 1px solid rgba(255,255,255,0.2);" onclick="loadView('profile')">MY LOGBOOK</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="glass-card glass-dark">
                <h3 style="color: var(--iaf-sky); margin-bottom: 1rem;">COMMAND CENTER</h3>
                <p>Welcome to the AirWing Command and Control Hub. You have full operational authority to manage cadet squadrons, authorize camp deployments, and issue mission orders.</p>
                <div class="stats-grid" style="margin-top: 2rem; background: transparent; padding: 0;">
                    <div class="stat-card" style="background: rgba(255,255,255,0.05); color: white; border-color: rgba(255,255,255,0.1);">
                        <h3 style="color: rgba(255,255,255,0.6)">SQUADRON STATUS</h3>
                        <p style="color: white">Ready for Dispatch</p>
                    </div>
                </div>
            </div>
        `;
    }
}

async function renderProfile() {
    const profile = await apiFetch('/cadets/profile');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div class="glass-card" style="background:white; color:var(--iaf-blue);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                <h2>CADET SERVICE RECORD</h2>
                <div class="badge badge-verified">ACTIVE DUTY</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">FULL NAME</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.name.toUpperCase()}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">OFFICIAL ID</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.cadet_id}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">CURRENT RANK</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.rank}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">WING/DEPARTMENT</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.department}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">FLIGHT CONTACT</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.contact}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">EMAIL TERMINAL</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.email}</p></div>
            </div>
            <div style="margin-top: 3rem; padding: 2rem; background: var(--bg-light); border-radius: 15px; border-left: 5px solid var(--iaf-saffron);">
                <p style="font-weight: 800; color: var(--iaf-blue);">TOTAL MERIT SCORE: ${profile.performance_score}</p>
            </div>
        </div>
    `;
}

async function renderAnnouncements() {
    const res = await apiFetch('/announcements');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div style="margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">LATEST ORDERS & BRIEFINGS</p>
        </div>
        <div class="announcement-list">
            ${res.map(ann => `
                <div class="glass-card" style="background: white; border-left: 5px solid var(--iaf-sky); margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h4 style="color: var(--iaf-blue); text-transform: uppercase; letter-spacing: 1px;">${ann.title}</h4>
                        <span class="badge badge-verified" style="background: #e0f2fe; color: #0369a1;">SQUADRON ORDER</span>
                    </div>
                    <p style="color: #475569; margin-bottom: 1rem;">${ann.content}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <small style="color: #94a3b8; font-weight: 600;">DATE: ${new Date(ann.created_at).toLocaleDateString('en-IN')}</small>
                        <small style="color: var(--iaf-saffron); font-weight: 700;">TARGET: ${ann.role_target.toUpperCase()}</small>
                    </div>
                </div>
            `).join('')}
        </div>`;
}

async function renderCamps() {
    const res = await apiFetch('/camps');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div class="camps-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem;">
            ${res.map(camp => `
                <div class="stat-card" style="display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                        <h4 style="font-size: 1.25rem; color: var(--iaf-blue); text-transform: uppercase;">${camp.name}</h4>
                        <span style="font-size: 1.5rem;">✈️</span>
                    </div>
                    <div style="flex-grow: 1;">
                        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem; font-weight: 600;">LOCATION: ${camp.location.toUpperCase()}</p>
                        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem; font-weight: 600;">START DATE: ${new Date(camp.date).toLocaleDateString('en-IN')}</p>
                        <p style="color: #475569; font-size: 0.95rem; margin-bottom: 2rem;">${camp.description}</p>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; border-radius: 12px; padding: 1rem;" onclick="registerCamp(${camp.id})">REGISTER FOR MISSION</button>
                </div>
            `).join('')}
        </div>`;
}

async function registerCamp(id) {
    const res = await apiFetch('/camps/register', { method: 'POST', body: JSON.stringify({ camp_id: id }) });
    alert(res.message);
}

async function renderPostAnnouncement() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div class="auth-form" style="width: 100%; max-width: 600px;">
            <div class="form-group"><label>Title</label><input type="text" id="annTitle"></div>
            <div class="form-group"><label>Content</label><textarea id="annContent" rows="5" style="width:100%"></textarea></div>
            <div class="form-group"><label>Target Audience</label>
                <select id="annTarget"><option value="All">All</option><option value="Student">Cadets Only</option><option value="CTO">CTOs Only</option></select>
            </div>
            <button class="btn btn-primary" onclick="submitAnnouncement()">Publish</button>
        </div>`;
}

async function submitAnnouncement() {
    const title = document.getElementById('annTitle').value;
    const content = document.getElementById('annContent').value;
    const role_target = document.getElementById('annTarget').value;
    const res = await apiFetch('/announcements', { method: 'POST', body: JSON.stringify({ title, content, role_target }) });
    alert(res.message); loadView('announcements');
}

async function renderManageCamps() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
            <p style="color: #64748b; font-weight: 600;">MISSION COMMAND & DEPLOYMENT</p>
            <button class="btn btn-accent" onclick="showCampForm()" style="border-radius: 50px; padding: 0.8rem 2rem;">+ ADD MISSION</button>
        </div>
        
        <div id="campForm" style="display:none; margin-bottom:3rem;" class="glass-card">
            <h3 style="color: var(--iaf-blue); margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 1px;">Initialize New Mission</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                <div class="form-group"><label>Mission Name</label><input type="text" id="cName" placeholder="e.g., Vayu Sena Camp 2026"></div>
                <div class="form-group"><label>Deployment Date</label><input type="date" id="cDate"></div>
                <div class="form-group"><label>Operation Location</label><input type="text" id="cLoc" placeholder="e.g., Jodhpur AFS"></div>
                <div class="form-group"><label>Mission Briefing</label><textarea id="cDesc" style="width:100%; border-radius: 8px; border: 1px solid #ddd; padding: 0.8rem;" rows="3"></textarea></div>
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                <button class="btn btn-primary" onclick="submitCamp()" style="flex: 1; border-radius: 12px;">AUTHORIZE MISSION</button>
                <button class="btn" style="background: #f1f5f9; color: #475569; border-radius: 12px;" onclick="document.getElementById('campForm').style.display='none'">CANCEL</button>
            </div>
        </div>
        
        <div id="campList" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;"></div>`;

    const camps = await apiFetch('/camps');
    document.getElementById('campList').innerHTML = camps.map(c => `
        <div class="stat-card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--iaf-blue);">
            <div>
                <h4 style="color: var(--iaf-blue); text-transform: uppercase; font-weight: 800; margin-bottom: 0.5rem;">${c.name}</h4>
                <p style="font-size: 0.75rem; font-weight: 700; color: #64748b;">DATE: ${new Date(c.date).toLocaleDateString()}</p>
            </div>
            <button class="btn btn-primary" style="margin-top: 1.5rem; background: transparent; border: 1px solid var(--iaf-blue); color: var(--iaf-blue); font-size: 0.8rem;" onclick="viewParticipants(${c.id})">VIEW SQUADRON LIST</button>
        </div>`).join('');
}

function showCampForm() { document.getElementById('campForm').style.display = 'block'; }
async function submitCamp() {
    const payload = { name: document.getElementById('cName').value, date: document.getElementById('cDate').value, location: document.getElementById('cLoc').value, description: document.getElementById('cDesc').value };
    const res = await apiFetch('/camps', { method: 'POST', body: JSON.stringify(payload) });
    alert(res.message); renderManageCamps();
}

async function renderManageCadets() {
    const cadets = await apiFetch('/cadets/all');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div class="glass-card" style="background: white; padding: 0; overflow: hidden; border-radius: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: var(--iaf-blue); color: white;">
                    <tr>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">SQUADRON MEMBER</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">OFFICIAL ID</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">CADET RANK</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">MERIT SCORE</th>
                        <th style="padding: 1.5rem; text-align: center; font-size: 0.75rem; letter-spacing: 1px;">OPERATION</th>
                    </tr>
                </thead>
                <tbody>
                    ${cadets.map(c => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 1.5rem; font-weight: 700; color: var(--primary);">${c.name.toUpperCase()}</td>
                            <td style="padding: 1.5rem; color: #475569;">${c.cadet_id}</td>
                            <td style="padding: 1.5rem;"><span class="badge badge-verified" style="background: #e0f2fe; color: #0369a1;">${c.rank}</span></td>
                            <td style="padding: 1.5rem; font-weight: 800; color: var(--iaf-saffron);">${c.performance_score}</td>
                            <td style="padding: 1.5rem; text-align: center;">
                                <button class="btn btn-accent" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="evaluateRank(${c.id})">EVALUATE RANK</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

async function evaluateRank(id) {
    const res = await apiFetch(`/cadets/${id}/evaluate`);
    alert(res.message);
    renderManageCadets();
}

async function viewParticipants(campId) {
    const participants = await apiFetch(`/camps/${campId}/participants`);
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <button class="btn btn-primary" style="background: #64748b;" onclick="loadView('manage-camps')">← RETURN TO MISSIONS</button>
            <h3 style="color: var(--iaf-blue); letter-spacing: 1px;">CAMPAIGN SQUADRON LIST</h3>
        </div>
        <div class="glass-card" style="background: white; padding: 0; overflow: hidden; border-radius: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: var(--iaf-green); color: white;">
                    <tr>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">PILOT NAME</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">SQUADRON ID</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">DEPLOYMENT STATUS</th>
                        <th style="padding: 1.5rem; text-align: center; font-size: 0.75rem; letter-spacing: 1px;">ACTION</th>
                    </tr>
                </thead>
                <tbody>
                    ${participants.map(p => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 1.5rem; font-weight: 700; color: var(--primary);">${p.name.toUpperCase()}</td>
                            <td style="padding: 1.5rem; color: #475569;">${p.official_id}</td>
                            <td style="padding: 1.5rem;">
                                <span class="badge ${p.status === 'Completed' ? 'badge-verified' : 'badge-pending'}">${p.status.toUpperCase()}</span>
                            </td>
                            <td style="padding: 1.5rem; text-align: center;">
                                ${p.status !== 'Completed' ? `<button class="btn btn-primary" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="updateAttendance(${p.id}, 'Completed')">COMPLETE MISSION</button>` : '<span style="color: var(--iaf-green); font-weight: 800;">MISSION SUCCESS</span>'}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

async function updateAttendance(id, status) {
    const res = await apiFetch('/camps/attendance', { method: 'PUT', body: JSON.stringify({ id, status }) });
    alert(res.message);
    // User can back out to refresh
}

async function renderVerifyDocs() {
    const docs = await apiFetch('/documents');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div class="glass-card" style="background: white; padding: 0; overflow: hidden; border-radius: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: var(--iaf-blue); color: white;">
                    <tr>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">SQUADRON MEMBER</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">DOCUMENT TYPE</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">LOGBOOK ENTRY</th>
                        <th style="padding: 1.5rem; text-align: center; font-size: 0.75rem; letter-spacing: 1px;">VERIFICATION</th>
                    </tr>
                </thead>
                <tbody>
                    ${docs.map(d => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 1.5rem; font-weight: 700; color: var(--primary);">${d.cadet_name.toUpperCase()}</td>
                            <td style="padding: 1.5rem; color: #475569;">${d.type}</td>
                            <td style="padding: 1.5rem;"><a href="${d.file_path}" target="_blank" style="color: var(--iaf-sky); font-weight: 700; text-decoration: none;">VIEW LOG →</a></td>
                            <td style="padding: 1.5rem; text-align: center;">
                                ${d.status === 'Pending' ? `
                                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                                        <button class="btn btn-primary" style="background: var(--iaf-green); font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="verifyDoc(${d.id}, 'Verified')">VERIFY</button>
                                        <button class="btn-primary" style="background: #ef4444; border:none; color:white; border-radius:6px; font-size: 0.75rem; padding: 0.5rem 1rem; cursor:pointer;" onclick="verifyDoc(${d.id}, 'Rejected')">REJECT</button>
                                    </div>
                                ` : `<span class="badge ${d.status === 'Verified' ? 'badge-verified' : 'badge-pending'}" style="${d.status === 'Rejected' ? 'background:#fee2e2; color:#b91c1c;' : ''}">${d.status.toUpperCase()}</span>`}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

async function verifyDoc(id, status) {
    const res = await apiFetch('/documents/verify', { method: 'PUT', body: JSON.stringify({ id, status }) });
    alert(res.message); renderVerifyDocs();
}

async function renderGenCerts() {
    const cadets = await apiFetch('/cadets/all');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div class="glass-card" style="background: white; max-width: 600px; margin: auto;">
            <h3 style="color: var(--iaf-blue); margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 1px;">Authorize Aero Certificate</h3>
            <div class="form-group"><label>Target Pilot / Cadet</label>
                <select id="certCadet" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    ${cadets.map(c => `<option value="${c.id}">${c.name.toUpperCase()} (${c.cadet_id})</option>`).join('')}
                </select>
            </div>
            <div class="form-group"><label>Certificate Type (e.g., Vayu Sena C-I)</label><input type="text" id="certType" placeholder="Certificate Title"></div>
            <div class="form-group"><label>Authorized Campaign / Camp</label><input type="text" id="certCamp" placeholder="Campaign Name"></div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; border-radius: 12px; font-weight: 800;" onclick="submitGenCert()">GENERATE & AUTHORIZE</button>
        </div>`;
}

async function submitGenCert() {
    const payload = { cadet_id: document.getElementById('certCadet').value, type: document.getElementById('certType').value, camp_name: document.getElementById('certCamp').value };
    const res = await apiFetch('/certificates/generate', { method: 'POST', body: JSON.stringify(payload) });
    alert(res.message); if (res.file_path) window.open(res.file_path);
}

async function renderDocuments() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
            <div class="glass-card" style="background:white;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 2rem; font-size: 1.1rem; letter-spacing: 1px;">SUBMIT MISSION DOCUMENTS</h3>
                <form id="docUploadForm">
                    <div class="form-group">
                        <label>Document Category</label>
                        <select id="upType" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                            <option value="NCC ID">NCC ID Card</option>
                            <option value="Aadhar">Aadhar Card / Identity</option>
                            <option value="Medical">Medical Fitness</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Select Log/File</label>
                        <input type="file" id="upFile" style="padding: 0.5rem 0;">
                    </div>
                    <button type="button" class="btn btn-primary" style="width: 100%; margin-top: 1rem; border-radius: 12px;" onclick="uploadDoc()">UPLOAD TO TERMINAL</button>
                </form>
            </div>
            
            <div id="docList" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Filled below -->
            </div>
        </div>`;

    const docs = await apiFetch('/documents');
    document.getElementById('docList').innerHTML = docs.length ? docs.map(d => `
        <div class="stat-card" style="background: white; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--iaf-sky);">
            <div>
                <p style="font-weight: 800; color: var(--iaf-blue);">${d.type.toUpperCase()}</p>
                <p style="font-size: 0.75rem; color: #64748b; font-weight: 600;">STATUS: <span style="color: ${d.status === 'Verified' ? 'var(--iaf-green)' : 'var(--iaf-saffron)'}">${d.status.toUpperCase()}</span></p>
            </div>
            <a href="${d.file_path}" target="_blank" class="btn" style="background: #f1f5f9; color: var(--iaf-blue); font-size: 0.75rem;">VIEW LOG</a>
        </div>`).join('') : '<div class="glass-card" style="text-align: center; color: #64748b;">No documents uploaded to squadron database yet.</div>';
}

async function uploadDoc() {
    const formData = new FormData();
    formData.append('type', document.getElementById('upType').value);
    formData.append('document', document.getElementById('upFile').files[0]);
    const response = await fetch('/api/documents/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }, body: formData });
    const res = await response.json(); alert(res.message); renderDocuments();
}

async function renderCertificates() {
    const certs = await apiFetch('/certificates');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div style="margin-bottom: 2rem;"><p style="color: #64748b; font-weight: 600;">YOUR AUTHORIZED SQUADRON AWARDS</p></div>
        <div class="camps-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${certs.map(c => `
                <div class="stat-card" style="text-align: center; background: white; border-top: 5px solid var(--iaf-saffron);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎖️</div>
                    <h4 style="color: var(--iaf-blue); text-transform: uppercase; margin-bottom: 1rem;">${c.type}</h4>
                    <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 1.5rem; font-weight: 600;">SQUADRON CERTIFICATE</p>
                    <a href="${c.file_path}" target="_blank" class="btn btn-primary" style="width: 100%; border-radius: 12px; background: var(--iaf-blue);">DOWNLOAD PDF</a>
                </div>
            `).join('')}
        </div>
        ${certs.length === 0 ? '<div class="glass-card" style="text-align: center; color: #64748b;">No aero certificates issued yet. Complete missions to earn awards!</div>' : ''}
    `;
}
