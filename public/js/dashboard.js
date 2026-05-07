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
        case 'my-attendance': renderMyAttendance(); break;
        case 'announcements': renderAnnouncements(); break;
        case 'camps': renderCamps(); break;
        case 'manage-camps': renderManageCamps(); break;
        case 'post-announcement': renderPostAnnouncement(); break;
        case 'manage-cadets': renderManageCadets(); break;
        case 'attendance': renderAttendance(); break;
        case 'verify-docs': renderVerifyDocs(); break;
        case 'quartermaster': renderQuartermaster(); break;
        case 'my-gear': renderMyGear(); break;
        case 'admin-assessments': renderAdminAssessments(); break;
        case 'my-assessments': renderMyAssessments(); break;
        case 'gallery': renderGallery(); break;
        case 'gen-certs': renderGenCerts(); break;
        case 'documents': renderDocuments(); break;
        case 'materials': renderStudyMaterials(); break;
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

async function renderMyAttendance() {
    const container = document.getElementById('dynamicContent');
    const stats = await apiFetch('/attendance/mystats');
    
    // Determine color based on attendance percentage (e.g. < 75% is red/warning)
    let percentageColor = 'var(--iaf-green)';
    if (stats.attendance_percentage < 75) percentageColor = '#ef4444'; // Red
    else if (stats.attendance_percentage < 85) percentageColor = 'var(--iaf-saffron)'; // Orange
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">MY ATTENDANCE RECORD</p>
        </div>

        <div class="glass-card" style="background: white; padding: 3rem; text-align: center; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <div style="margin-bottom: 3rem;">
                <h3 style="color: var(--iaf-blue); letter-spacing: 1px; margin-bottom: 1rem; text-transform: uppercase;">Overall Attendance</h3>
                <div style="display: inline-flex; justify-content: center; align-items: center; width: 180px; height: 180px; border-radius: 50%; border: 12px solid ${percentageColor}; box-shadow: inset 0 0 20px rgba(0,0,0,0.05);">
                    <span style="font-size: 3.5rem; font-weight: 900; color: ${percentageColor};">${stats.attendance_percentage}%</span>
                </div>
                ${stats.total_classes === 0 ? '<p style="margin-top: 1rem; color: #94a3b8; font-weight: 600;">No attendance records found yet.</p>' : ''}
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; border-top: 1px solid #f1f5f9; padding-top: 3rem;">
                <div>
                    <p style="font-size: 0.85rem; color: #64748b; font-weight: 800; letter-spacing: 1px;">TOTAL CLASSES</p>
                    <p style="font-size: 2.5rem; font-weight: 800; color: var(--iaf-blue);">${stats.total_classes}</p>
                </div>
                <div>
                    <p style="font-size: 0.85rem; color: #64748b; font-weight: 800; letter-spacing: 1px;">CLASSES PRESENT</p>
                    <p style="font-size: 2.5rem; font-weight: 800; color: var(--iaf-green);">${stats.present_count}</p>
                </div>
                <div>
                    <p style="font-size: 0.85rem; color: #64748b; font-weight: 800; letter-spacing: 1px;">CLASSES ABSENT</p>
                    <p style="font-size: 2.5rem; font-weight: 800; color: #ef4444;">${stats.absent_count}</p>
                </div>
            </div>
            
            ${stats.leave_count > 0 ? `
                <div style="margin-top: 2rem; padding: 1rem; background: #fffbeb; border-radius: 10px; color: #b45309; font-weight: 600;">
                    You have been granted leave for ${stats.leave_count} official classes.
                </div>
            ` : ''}
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

let globalManageCamps = []; // Store fetched camps for search filtering

async function renderManageCamps() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">MISSION COMMAND & DEPLOYMENT</p>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <input type="text" id="campSearchInput" onkeyup="filterCampList()" placeholder="Search Mission Name or Date..." style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 280px;">
                <button class="btn btn-accent" onclick="showCampForm()" style="border-radius: 50px; padding: 0.8rem 2rem;">+ ADD MISSION</button>
            </div>
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

    globalManageCamps = await apiFetch('/camps');
    renderCampCards(globalManageCamps);
}

function renderCampCards(campsList) {
    document.getElementById('campList').innerHTML = campsList.map(c => {
        const dateStr = new Date(c.date).toLocaleDateString('en-GB'); // formatted as DD/MM/YYYY
        return `
            <div class="stat-card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--iaf-blue);">
                <div>
                    <h4 style="color: var(--iaf-blue); text-transform: uppercase; font-weight: 800; margin-bottom: 0.5rem;">${c.name}</h4>
                    <p style="font-size: 0.75rem; font-weight: 700; color: #64748b;">DATE: ${dateStr}</p>
                </div>
                <button class="btn btn-primary" style="margin-top: 1.5rem; background: transparent; border: 1px solid var(--iaf-blue); color: var(--iaf-blue); font-size: 0.8rem;" onclick="viewParticipants(${c.id})">VIEW SQUADRON LIST</button>
            </div>
        `;
    }).join('');
}

function filterCampList() {
    const query = document.getElementById('campSearchInput').value.toLowerCase();
    const filtered = globalManageCamps.filter(c => {
        const dateStr = new Date(c.date).toLocaleDateString('en-GB').toLowerCase();
        return (c.name && c.name.toLowerCase().includes(query)) || dateStr.includes(query);
    });
    renderCampCards(filtered);
}

function showCampForm() { document.getElementById('campForm').style.display = 'block'; }
async function submitCamp() {
    const payload = { name: document.getElementById('cName').value, date: document.getElementById('cDate').value, location: document.getElementById('cLoc').value, description: document.getElementById('cDesc').value };
    const res = await apiFetch('/camps', { method: 'POST', body: JSON.stringify(payload) });
    alert(res.message); renderManageCamps();
}

let globalCadets = []; // Store fetched cadets for search filtering

async function renderManageCadets() {
    globalCadets = await apiFetch('/cadets/all');
    const container = document.getElementById('dynamicContent');
    
    const uiStructure = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">SQUADRON OVERSIGHT</p>
            <input type="text" id="cadetSearchInput" onkeyup="filterCadetTable()" placeholder="Search Name or Official ID..." style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 300px;">
        </div>
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
                <tbody id="cadetTableBody">
                </tbody>
            </table>
        </div>`;
    
    container.innerHTML = uiStructure;
    renderCadetTableRows(globalCadets);
}

function renderCadetTableRows(cadetsList) {
    const tbody = document.getElementById('cadetTableBody');
    tbody.innerHTML = cadetsList.map(c => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 1.5rem; font-weight: 700; color: var(--primary);">
                <a href="#" onclick="viewCadetDetails(${c.id})" style="color: var(--iaf-blue); text-decoration: none; cursor: pointer;">${c.name.toUpperCase()}</a>
            </td>
            <td style="padding: 1.5rem; color: #475569;">${c.cadet_id}</td>
            <td style="padding: 1.5rem;"><span class="badge badge-verified" style="background: #e0f2fe; color: #0369a1;">${c.rank}</span></td>
            <td style="padding: 1.5rem; font-weight: 800; color: var(--iaf-saffron);">${c.performance_score}</td>
            <td style="padding: 1.5rem; text-align: center; display: flex; gap: 0.5rem; justify-content: center;">
                <button class="btn btn-accent" style="font-size: 0.75rem; padding: 0.5rem 1rem;" onclick="evaluateRank(${c.id})">EVALUATE RANK</button>
                <button class="btn" style="background: #ef4444; color: white; border: none; font-size: 0.75rem; padding: 0.5rem 1rem; border-radius: 8px; cursor:pointer;" onclick="deleteCadet(${c.id}, '${c.name.split("'").join("\\'")}')">REMOVE SQUADRON</button>
            </td>
        </tr>
    `).join('');
}

function filterCadetTable() {
    const query = document.getElementById('cadetSearchInput').value.toLowerCase();
    const filtered = globalCadets.filter(c => 
        (c.name && c.name.toLowerCase().includes(query)) || 
        (c.cadet_id && c.cadet_id.toLowerCase().includes(query))
    );
    renderCadetTableRows(filtered);
}

async function viewCadetDetails(id) {
    const profile = globalCadets.find(c => c.id === id);
    if (!profile) return;

    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <button class="btn btn-primary" style="background: #64748b;" onclick="loadView('manage-cadets')">← RETURN TO SQUADRON LIST</button>
            <h3 style="color: var(--iaf-blue); letter-spacing: 1px;">CADET SERVICE RECORD</h3>
        </div>
        <div class="glass-card" style="background:white; color:var(--iaf-blue);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem;">
                <h2>${profile.name.toUpperCase()}</h2>
                <div class="badge badge-verified">ACTIVE DUTY</div>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem;">
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">OFFICIAL ID</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.cadet_id}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">CURRENT RANK</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.rank}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">WING/DEPARTMENT</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.department || 'N/A'}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">FLIGHT CONTACT</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.contact || 'N/A'}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">EMAIL TERMINAL</p><p style="font-size: 1.2rem; font-weight: 600;">${profile.email || 'N/A'}</p></div>
                <div><p style="font-size: 0.8rem; color: #64748b; font-weight: 700;">ENLISTMENT DATE</p><p style="font-size: 1.2rem; font-weight: 600;">${new Date(profile.created_at).toLocaleDateString()}</p></div>
            </div>
            <div style="margin-top: 3rem; padding: 2rem; background: var(--bg-light); border-radius: 15px; border-left: 5px solid var(--iaf-saffron);">
                <p style="font-weight: 800; color: var(--iaf-blue);">TOTAL MERIT SCORE: ${profile.performance_score}</p>
            </div>
        </div>
    `;
}

async function deleteCadet(id, name) {
    if(!confirm(`WARNING: Are you sure you want to completely remove Cadet ${name} from the squadron? This physical and portal access record will be permanently erased.`)) return;

    try {
        const res = await apiFetch('/cadets/' + id, { method: 'DELETE' });
        alert(res.message);
        renderManageCadets(); // Refresh the cadet list view
    } catch(err) {
        alert("Failed to remove cadet");
    }
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

async function renderAttendance() {
    const container = document.getElementById('dynamicContent');
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">SQUADRON DAILY ATTENDANCE</p>
            <div style="display: flex; gap: 1rem; align-items: center;">
                <label style="font-weight: 700; color: var(--iaf-blue); font-size: 0.8rem;">SESSION TYPE:</label>
                <select id="attendanceSession" onchange="fetchAttendanceForDate()" style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 170px; color: var(--text-dark); font-weight: 600;">
                    <option value="Daily Class">Daily Class</option>
                    <option value="Saturday Parade">Saturday Parade</option>
                </select>
                <label style="font-weight: 700; color: var(--iaf-blue); font-size: 0.8rem; margin-left: 1rem;">SELECT DATE:</label>
                <input type="date" id="attendanceDate" value="${today}" onchange="fetchAttendanceForDate()" style="padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; width: 200px; color: var(--text-dark); font-weight: 600;">
            </div>
        </div>

        <div class="glass-card" style="background: white; padding: 0; overflow: hidden; border-radius: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: var(--iaf-blue); color: white;">
                    <tr>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">SQUADRON MEMBER</th>
                        <th style="padding: 1.5rem; text-align: left; font-size: 0.75rem; letter-spacing: 1px;">OFFICIAL ID</th>
                        <th style="padding: 1.5rem; text-align: center; font-size: 0.75rem; letter-spacing: 1px;">STATUS LOG</th>
                    </tr>
                </thead>
                <tbody id="attendanceTableBody">
                    <tr><td colspan="3" style="padding: 2rem; text-align: center; color: #64748b;">Loading squadron data...</td></tr>
                </tbody>
            </table>
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
            <button class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1rem;" onclick="submitAttendance()">SAVE ATTENDANCE RECORD</button>
        </div>
    `;

    // Load initial data for the default date
    await fetchAttendanceForDate();
}

let globalAttendanceCadets = [];

async function fetchAttendanceForDate() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const sessionType = document.getElementById('attendanceSession')?.value || 'Daily Class';
    if (!selectedDate) return;

    // Fetch all cadets first to ensure we have a full roster
    const allCadets = await apiFetch('/cadets/all');
    
    // Fetch any explicitly saved attendance records for this date
    const attendanceRecords = await apiFetch('/attendance/' + selectedDate + '/' + encodeURIComponent(sessionType));
    
    // Map records into an easy lookup object
    const savedMap = {};
    if (Array.isArray(attendanceRecords)) {
        attendanceRecords.forEach(record => {
            savedMap[record.cadet_id] = record.status;
        });
    }

    // Default missing records to 'Present' for easier bulk logging
    globalAttendanceCadets = allCadets.map(cadet => ({
        ...cadet,
        attendanceStatus: savedMap[cadet.id] || 'Present' 
    }));

    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = globalAttendanceCadets.map(c => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 1.5rem; font-weight: 700; color: var(--primary);">${c.name.toUpperCase()}</td>
            <td style="padding: 1.5rem; color: #475569;">${c.cadet_id}</td>
            <td style="padding: 1.5rem; text-align: center;">
                <div style="display: inline-flex; overflow: hidden; border-radius: 8px; border: 1px solid #cbd5e1; font-weight:600;">
                    <label style="padding: 0.5rem 1rem; cursor: pointer; color: ${c.attendanceStatus === 'Present' ? 'white' : '#166534'}; background: ${c.attendanceStatus === 'Present' ? 'var(--iaf-green)' : '#f8fafc'}; transition: 0.2s;">
                        <input type="radio" name="att_${c.id}" value="Present" ${c.attendanceStatus === 'Present' ? 'checked' : ''} style="display: none;" onchange="updateLocalAttendanceStatus(${c.id}, 'Present')"> PRESENT
                    </label>
                    <label style="padding: 0.5rem 1rem; cursor: pointer; color: ${c.attendanceStatus === 'Absent' ? 'white' : '#b91c1c'}; background: ${c.attendanceStatus === 'Absent' ? '#ef4444' : '#f8fafc'}; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; transition: 0.2s;">
                        <input type="radio" name="att_${c.id}" value="Absent" ${c.attendanceStatus === 'Absent' ? 'checked' : ''} style="display: none;" onchange="updateLocalAttendanceStatus(${c.id}, 'Absent')"> ABSENT
                    </label>
                    <label style="padding: 0.5rem 1rem; cursor: pointer; color: ${c.attendanceStatus === 'On Leave' ? 'white' : '#b45309'}; background: ${c.attendanceStatus === 'On Leave' ? 'var(--iaf-saffron)' : '#f8fafc'}; transition: 0.2s;">
                        <input type="radio" name="att_${c.id}" value="On Leave" ${c.attendanceStatus === 'On Leave' ? 'checked' : ''} style="display: none;" onchange="updateLocalAttendanceStatus(${c.id}, 'On Leave')"> ON LEAVE
                    </label>
                </div>
            </td>
        </tr>
    `).join('');
}

// Visual update logic for the custom radio buttons
window.updateLocalAttendanceStatus = function(cadetId, newStatus) {
    const cadet = globalAttendanceCadets.find(c => c.id === cadetId);
    if(cadet) cadet.attendanceStatus = newStatus;
    
    // Manual visual toggle for smoothness instead of full re-render
    const radios = document.getElementsByName('att_' + cadetId);
    radios.forEach(radio => {
        const parentLabel = radio.parentElement;
        if(radio.value === 'Present') {
             parentLabel.style.background = radio.checked ? 'var(--iaf-green)' : '#f8fafc';
             parentLabel.style.color = radio.checked ? 'white' : '#166534';
        } else if(radio.value === 'Absent') {
             parentLabel.style.background = radio.checked ? '#ef4444' : '#f8fafc';
             parentLabel.style.color = radio.checked ? 'white' : '#b91c1c';
        } else if(radio.value === 'On Leave') {
             parentLabel.style.background = radio.checked ? 'var(--iaf-saffron)' : '#f8fafc';
             parentLabel.style.color = radio.checked ? 'white' : '#b45309';
        }
    });
};

async function submitAttendance() {
    const selectedDate = document.getElementById('attendanceDate').value;
    const sessionType = document.getElementById('attendanceSession')?.value || 'Daily Class';
    if (!selectedDate) return alert("Please select a date first.");

    const payloadRecords = globalAttendanceCadets.map(c => ({
        cadet_id: c.id,
        status: c.attendanceStatus
    }));

    try {
        const res = await apiFetch('/attendance', { 
            method: 'POST', 
            body: JSON.stringify({ date: selectedDate, session_type: sessionType, records: payloadRecords }) 
        });
        alert(res.message || "Attendance saved successfully!");
    } catch (e) {
        alert("Error saving attendance.");
    }
}

async function renderGenCerts() {
    const cadets = await apiFetch('/cadets/all');
    const container = document.getElementById('dynamicContent');
    container.innerHTML = `
        <div class="glass-card" style="background: white; max-width: 600px; margin: auto;">
            <h3 style="color: var(--iaf-blue); margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 1px;">Authorize Aero Certificate</h3>
            <div class="form-group"><label>Target Pilot / Cadet</label>
                <input list="cadetList" id="certCadetInput" oninput="updateHiddencertCadetID()" placeholder="Search Name or ID..." style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                <datalist id="cadetList">
                    ${cadets.map(c => `<option data-id="${c.id}" value="${c.name.toUpperCase()} (${c.cadet_id})"></option>`).join('')}
                </datalist>
                <input type="hidden" id="certCadet">
            </div>
            <div class="form-group"><label>Certificate Type (e.g., Vayu Sena C-I)</label><input type="text" id="certType" placeholder="Certificate Title"></div>
            <div class="form-group"><label>Authorized Campaign / Camp</label><input type="text" id="certCamp" placeholder="Campaign Name"></div>
            <button class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; border-radius: 12px; font-weight: 800;" onclick="submitGenCert()">GENERATE & AUTHORIZE</button>
        </div>`;
}

function updateHiddencertCadetID() {
    const inputVal = document.getElementById('certCadetInput').value;
    const datalist = document.getElementById('cadetList');
    for (let i = 0; i < datalist.options.length; i++) {
        if (datalist.options[i].value === inputVal) {
            document.getElementById('certCadet').value = datalist.options[i].getAttribute('data-id');
            break;
        }
    }
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
                    <a href="${c.file_path}" target="_blank" class="btn btn-primary" style="width: 100%; border-radius: 12px; background: var(--iaf-blue); color: white;">DOWNLOAD PDF</a>
                </div>
            `).join('')}
        </div>
        ${certs.length === 0 ? '<div class="glass-card" style="text-align: center; color: #64748b;">No aero certificates issued yet. Complete missions to earn awards!</div>' : ''}
    `;
}


async function renderQuartermaster() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = '<p>Loading Quartermaster...</p>';
    
    let inventory = [], cadets = [], issuedGear = [];
    try {
        const [invData, cadData, issuedData] = await Promise.all([
            apiFetch('/inventory'),
            apiFetch('/cadets/all'),
            apiFetch('/inventory/issued')
        ]);
        inventory = invData; cadets = cadData; issuedGear = issuedData;
    } catch(e) { console.error("Error loading quartermaster data"); }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">QUARTERMASTER EQUIPMENT LOG</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; align-items: start;">
            <div class="glass-card" style="background: white; box-sizing: border-box; width: 100%; overflow: hidden;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Current Stock</h3>
                <div style="overflow-x: auto; width: 100%;">
                    <table class="table" style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid #f1f5f9; text-align: left; color: #64748b;">
                                <th>Item Name</th>
                                <th>Available / Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inventory.map(i => `
                                <tr style="border-bottom: 1px solid #f8fafc;">
                                    <td style="padding: 1rem 0; font-weight: 600; color: var(--iaf-blue);">${i.item_name}</td>
                                    <td style="padding: 1rem 0;">
                                        <span style="color: ${i.available_quantity > 0 ? 'var(--iaf-green)' : '#ef4444'}; font-weight: 800;">${i.available_quantity}</span> 
                                        <span style="color: #94a3b8;">/ ${i.total_quantity}</span>
                                    </td>
                                    <td style="text-align: right; padding: 1rem 0;">
                                        <button onclick="window.deleteStock(${i.id})" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Delete Item">
                                            <svg fill="currentColor" viewBox="0 0 24 24" style="width:20px; height:20px;"><path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="glass-card" style="background: white; box-sizing: border-box; width: 100%; overflow: hidden; grid-column: 1/-1;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Active Gear In Field</h3>
                <div style="overflow-x: auto; width: 100%;">
                    <table class="table" style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 0.85rem; text-transform: uppercase;">
                                <th style="padding-bottom: 1rem;">ID</th>
                                <th style="padding-bottom: 1rem;">Cadet Name</th>
                                <th style="padding-bottom: 1rem;">Item Issued</th>
                                <th style="padding-bottom: 1rem;">Issue Date</th>
                                <th style="padding-bottom: 1rem;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${issuedGear.map(g => `
                                <tr style="border-bottom: 1px solid #f8fafc;">
                                    <td style="padding: 1rem 0; font-weight: 900; color: var(--iaf-saffron);">#${g.issue_id}</td>
                                    <td style="padding: 1rem 0; font-weight: 600;">${g.cadet_name}</td>
                                    <td style="padding: 1rem 0; color: var(--iaf-blue);">${g.item_name}</td>
                                    <td style="padding: 1rem 0; color: #64748b;">${new Date(g.issue_date).toLocaleDateString()}</td>
                                    <td style="padding: 1rem 0;">
                                        <span style="padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 800; background: ${g.status === 'Issued' ? '#fef3c7' : '#dcfce7'}; color: ${g.status === 'Issued' ? '#92400e' : '#166534'};">
                                            ${g.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                            ${issuedGear.length === 0 ? '<tr><td colspan="5" style="padding: 1.5rem 0; text-align: center; color: #94a3b8;">No gear is currently assigned to any cadet.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style="width: 100%; box-sizing: border-box; overflow: hidden;">
                <div class="glass-card" style="background: white; margin-bottom: 2rem; box-sizing: border-box; width: 100%;">
                    <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Issue Gear</h3>
                    <div class="form-group">
                        <label>Select Item</label>
                        <input type="text" id="searchItem" placeholder="Search equipment..." onkeyup="window.filterSelect('searchItem', 'qmItemId')" style="width:100%; padding:0.5rem; margin-bottom: 0.5rem; border:1px solid #ddd; border-radius:5px; box-sizing:border-box;">
                        <select id="qmItemId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                            ${inventory.filter(i => i.available_quantity > 0).map(i => `<option value="${i.id}">${i.item_name} (Avail: ${i.available_quantity})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Issue To (Cadet)</label>
                        <input type="text" id="searchCadet" placeholder="Search cadet name..." onkeyup="window.filterSelect('searchCadet', 'qmCadetId')" style="width:100%; padding:0.5rem; margin-bottom: 0.5rem; border:1px solid #ddd; border-radius:5px; box-sizing:border-box;">
                        <select id="qmCadetId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                            ${cadets.map(c => `<option value="${c.id}">${c.name} (${c.cadet_id})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date Issued</label>
                        <input type="date" id="qmIssueDate" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                    </div>
                    <button class="btn btn-primary" style="width: 100%; font-weight: 800; box-sizing: border-box;" onclick="submitIssueGear()">ISSUE ITEM</button>
                    <button class="btn btn-secondary" style="width: 100%; font-weight: 800; margin-top: 0.5rem; background: #f1f5f9; color: var(--iaf-blue); box-sizing: border-box;" onclick="submitReturnGear()">LOG RETURN</button>
                </div>

                <div class="glass-card" style="background: white; box-sizing: border-box; width: 100%;">
                    <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Procure New Stock</h3>
                    <div class="form-group">
                        <label>Item Name (e.g. Beret Size L)</label>
                        <input type="text" id="qmNewName" style="padding: 0.8rem; width: 100%; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box;">
                    </div>
                    <div class="form-group">
                        <label>Quantity to Procure</label>
                        <input type="number" id="qmNewQty" value="1" min="1" style="padding: 0.8rem; width: 100%; border: 1px solid #ddd; border-radius: 8px; box-sizing: border-box;">
                    </div>
                    <button class="btn btn-primary" style="width: 100%; background: var(--iaf-saffron); font-weight: 800; box-sizing: border-box;" onclick="submitNewStock()">ADD TO ARMORY</button>
                </div>
            </div>
        </div>
    `;
}

async function submitNewStock() {
    const name = document.getElementById('qmNewName').value;
    const qty = document.getElementById('qmNewQty').value;
    if(!name || !qty) return alert('Enter item name and quantity');

    try {
        await apiFetch('/inventory/add', {
            method: 'POST',
            body: JSON.stringify({ item_name: name, quantity: qty })
        });
        alert('Stock Added Successfully');
        renderQuartermaster();
    } catch(e) { alert('Error adding stock'); }
}

window.deleteStock = async function(id) {
    if(!confirm('Delete this stock item entirely from armory?')) return;
    try {
        await apiFetch(`/inventory/delete/${id}`, { method: 'DELETE' });
        renderQuartermaster();
    } catch(e) { alert('Cannot delete item. It may be currently issued or locked.'); }
}

window.filterSelect = function(searchId, selectId) {
    let filter = document.getElementById(searchId).value.toUpperCase();
    let select = document.getElementById(selectId);
    
    if(!select.dataset.clonedOptions) {
        select.dataset.clonedOptions = select.innerHTML;
    }
    
    let temp = document.createElement('select');
    temp.innerHTML = select.dataset.clonedOptions;
    
    let matched = '';
    for (let i = 0; i < temp.options.length; i++) {
        let txtValue = temp.options[i].text;
        if (txtValue.toUpperCase().includes(filter)) {
            matched += temp.options[i].outerHTML;
        }
    }
    select.innerHTML = matched;
    if(select.options.length > 0) select.selectedIndex = 0;
}

async function submitIssueGear() {
    const itemId = document.getElementById('qmItemId').value;
    const cadetId = document.getElementById('qmCadetId').value;
    const date = document.getElementById('qmIssueDate').value;
    if(!itemId || !cadetId || !date) return alert('Fill all fields to issue gear.');

    try {
        const res = await apiFetch('/inventory/issue', {
            method: 'POST',
            body: JSON.stringify({ item_id: itemId, cadet_id: cadetId, issue_date: date })
        });
        alert(`Gear Issued Successfully!\n\nISSUE ID: #${res.issue_id}\nRETURN OTP: ${res.return_code}\n\n(Write this OTP down. The cadet needs it to return the item)`);
        renderQuartermaster();
    } catch(e) { alert('Error issuing gear (possibly out of stock)'); }
}

async function submitReturnGear() {
    const issueId = prompt("Enter the exact Issue ID # to log a return:");
    if(!issueId) return;

    const returnCode = prompt("Enter the 6-digit Return OTP (sent to cadet's email):");
    if(!returnCode) return;

    try {
        const res = await apiFetch(`/inventory/return/${issueId}`, {
            method: 'POST',
            body: JSON.stringify({ return_code: returnCode })
        });
        
        if (res.message && res.message.includes('Invalid')) {
            alert('Error: Incorrect Return OTP.');
            return;
        }

        alert('Gear returned to Armory Successfully.\nStock has been automatically increased.');
        renderQuartermaster();
    } catch(e) { alert('Error returning gear. Invalid ID, incorrect OTP, or already returned.'); }
}

async function renderMyGear() {
    const container = document.getElementById('dynamicContent');
    const gear = await apiFetch('/inventory/mygear');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">MY ISSUED EQUIPMENT</p>
        </div>
        <div class="glass-card" style="background: white;">
            ${gear.length === 0 ? '<p style="color: #94a3b8; text-align: center; padding: 2rem;">No equipment currently issued to you.</p>' : `
                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b;">
                            <th style="padding-bottom: 1rem;">Item Name</th>
                            <th style="padding-bottom: 1rem;">Date Issued</th>
                            <th style="padding-bottom: 1rem;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gear.map(g => `
                            <tr style="border-bottom: 1px solid #f8fafc;">
                                <td style="padding: 1.5rem 0; font-weight: 600; color: var(--iaf-blue);">${g.item_name}</td>
                                <td style="padding: 1.5rem 0; color: #64748b;">${new Date(g.issue_date).toLocaleDateString()}</td>
                                <td style="padding: 1.5rem 0;">
                                    <span style="padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: ${g.status === 'Issued' ? '#dcfce7' : '#f1f5f9'}; color: ${g.status === 'Issued' ? '#166534' : '#64748b'};">
                                        ${g.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `}
        </div>
    `;
}

// Map globally
window.submitNewStock = submitNewStock;
window.submitIssueGear = submitIssueGear;
window.submitReturnGear = submitReturnGear;



async function renderAdminAssessments() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = '<p>Loading Assessments...</p>';
    
    let cadets = [];
    try { cadets = await apiFetch('/cadets/all'); } catch(e) {}

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">TACTICAL EXAM ASSESSMENTS</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 2rem; align-items: start;">
            <div class="glass-card" style="background: white; box-sizing: border-box; width: 100%; overflow: hidden;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Log Squad Marks</h3>
                <div class="form-group">
                    <label>Select Cadet</label>
                    <select id="asmCadetId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                        ${cadets.map(c => `<option value="${c.id}">${c.name} (${c.cadet_id})</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Assessment Title (e.g. Drill Test A, Firing Range)</label>
                    <input type="text" id="asmTitle" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>Cadet Score</label>
                        <input type="number" id="asmScore" min="0" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                    </div>
                    <div class="form-group">
                        <label>Maximum Score</label>
                        <input type="number" id="asmMaxScore" min="1" value="100" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                    </div>
                </div>
                <div class="form-group">
                    <label>Date Conducted</label>
                    <input type="date" id="asmDate" value="${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                </div>
                <button class="btn btn-primary" style="width: 100%; font-weight: 800; background: var(--iaf-blue); margin-top: 1rem; box-sizing: border-box; color: white;" onclick="submitAssessment()">AUTHORIZE SCORE</button>
            </div>

            <div class="glass-card" style="background: var(--iaf-blue); color: white; box-sizing: border-box; width: 100%; overflow: hidden;">
                <h3 style="color: white; margin-bottom: 1.5rem;">Check Cadet History</h3>
                <div class="form-group">
                    <label style="color: #94a3b8;">Review Individual Cadet Performance</label>
                    <select id="asmHistoryCadetId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; box-sizing: border-box;" onchange="loadCadetAssessmentHistory()">
                        <option value="">-- SELECT CADET --</option>
                        ${cadets.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div id="asmHistoryDisplay" style="margin-top: 2rem; max-height: 300px; overflow-y: auto; padding-right: 0.5rem;">
                    <p style="color: #94a3b8; font-size: 0.85rem;">Select a cadet above to view their exam logs.</p>
                </div>
            </div>
        </div>
    `;
}

async function submitAssessment() {
    const cadet_id = document.getElementById('asmCadetId').value;
    const title = document.getElementById('asmTitle').value;
    const score = document.getElementById('asmScore').value;
    const maxScore = document.getElementById('asmMaxScore').value;
    const date = document.getElementById('asmDate').value;
    
    if(!title || !score || !maxScore) return alert('Fill all score parameters.');

    try {
        await apiFetch('/assessments/log', {
            method: 'POST',
            body: JSON.stringify({ cadet_id, assessment_title: title, score, max_score: maxScore, date })
        });
        alert('Score Logged Successfully');
        renderAdminAssessments();
    } catch(e) { alert('Error logging scores.'); }
}

async function loadCadetAssessmentHistory() {
    const display = document.getElementById('asmHistoryDisplay');
    const cadetId = document.getElementById('asmHistoryCadetId').value;
    if(!cadetId) { display.innerHTML = ''; return; }

    display.innerHTML = '<p>Loading...</p>';
    try {
        const scores = await apiFetch(`/assessments/cadet/${cadetId}`);
        if(scores.length === 0) {
           display.innerHTML = '<p style="color: var(--iaf-saffron);">No history found for this cadet.</p>';
        } else {
           display.innerHTML = scores.map(s => `
              <div style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border-left: 3px solid ${(s.score/s.max_score) >= 0.5 ? 'var(--iaf-green)' : '#ef4444'};">
                  <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 800; font-size: 1.1rem;">${s.assessment_title}</span>
                      <span style="font-weight: 900; color: ${(s.score/s.max_score) >= 0.5 ? 'var(--iaf-green)' : '#ef4444'};">${s.score} / ${s.max_score}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.5rem;">${new Date(s.date).toLocaleDateString()}</div>
              </div>
           `).join('');
        }
    } catch(e) {
        display.innerHTML = '<p style="color: red;">Error fetching history.</p>';
    }
}

async function renderMyAssessments() {
    const container = document.getElementById('dynamicContent');
    const scores = await apiFetch('/assessments/myscores');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">MY TACTICAL MARKS</p>
        </div>
        <div class="glass-card" style="background: white;">
            ${scores.length === 0 ? '<p style="color: #94a3b8; text-align: center; padding: 2rem;">Your examiner has not uploaded any scores yet.</p>' : `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    ${scores.map(s => {
                        const percent = (s.score / s.max_score) * 100;
                        const passColor = percent >= 50 ? 'var(--iaf-green)' : '#ef4444';
                        return `
                            <div style="border: 1px solid #f1f5f9; border-radius: 12px; padding: 1.5rem; border-top: 4px solid ${passColor};">
                                <h4 style="color: var(--iaf-blue); margin-bottom: 0.5rem; text-transform: uppercase;">${s.assessment_title}</h4>
                                <p style="color: #64748b; font-size: 0.8rem; margin-bottom: 1.5rem;">${new Date(s.date).toLocaleDateString()}</p>
                                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                    <span style="font-size: 2.5rem; font-weight: 900; color: ${passColor};">${s.score}</span>
                                    <span style="font-size: 1.2rem; font-weight: 600; color: #94a3b8;">/ ${s.max_score}</span>
                                </div>
                                <div style="margin-top: 1rem; width: 100%; background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="width: ${percent}%; background: ${passColor}; height: 100%;"></div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `}
        </div>
    `;
}

// Map globally
window.submitAssessment = submitAssessment;
window.loadCadetAssessmentHistory = loadCadetAssessmentHistory;



async function renderGallery() {
    const container = document.getElementById('dynamicContent');
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Quick load state
    container.innerHTML = '<p>Loading Squadron Gallery...</p>';
    
    let photos = [];
    try { photos = await apiFetch('/gallery'); } catch(e) {}

    let uploadSection = '';
    if (user.role === 'Admin' || user.role === 'CTO') {
        uploadSection = `
            <div class="glass-card" style="background: white; margin-bottom: 2rem; box-sizing: border-box; width: 100%;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Upload Operations Photo</h3>
                <form id="galleryUploadForm" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                    <div class="form-group" style="flex: 1; min-width: 200px;">
                        <label>Mission / Event Title</label>
                        <input type="text" id="galTitle" placeholder="e.g. Republic Day Parade 2026" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                    </div>
                    <div class="form-group" style="flex: 1; min-width: 200px;">
                        <label>Select Image File</label>
                        <input type="file" id="galFile" accept="image/*" style="width: 100%; padding: 0.65rem 0; box-sizing: border-box;">
                    </div>
                    <div class="form-group" style="flex: 2; min-width: 250px;">
                        <label>Description (Optional)</label>
                        <input type="text" id="galDesc" placeholder="Brief description of the snapshot" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd; box-sizing: border-box;">
                    </div>
                    <button type="button" class="btn btn-primary" style="padding: 0.9rem 2rem; border-radius: 8px; background: var(--iaf-blue); box-sizing: border-box; color: white;" onclick="submitGalleryPhoto()">UPLOAD TO ARCHIVE</button>
                </form>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">SQUADRON PHOTO ARCHIVE</p>
        </div>

        ${uploadSection}

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;" id="galleryGrid">
            ${photos.length === 0 ? '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 2rem;">No operational photos uploaded to the gallery yet.</p>' : `
                ${photos.map(p => `
                    <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.3s ease;">
                        <div style="height: 200px; overflow: hidden; position: relative; background: #f1f5f9;">
                            <img src="${p.image_url}" style="width: 100%; height: 100%; object-fit: cover; object-position: center;" alt="${p.title}">
                            ${(user.role === 'Admin' || user.role === 'CTO') ? `<button onclick="deleteGalleryPhoto(${p.id})" style="position: absolute; top: 10px; right: 10px; background: rgba(239, 68, 68, 0.9); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 5px; cursor: pointer; font-size: 0.7rem; font-weight: 800;">DELETE</button>` : ''}
                        </div>
                        <div style="padding: 1.5rem;">
                            <h4 style="color: var(--iaf-blue); margin-bottom: 0.5rem; font-size: 1.1rem; line-height: 1.3;">${p.title}</h4>
                            <p style="color: #64748b; font-size: 0.85rem; margin-bottom: 1rem;">${p.description || ''}</p>
                            <p style="color: #94a3b8; font-size: 0.75rem; font-weight: 600;">${new Date(p.uploaded_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                `).join('')}
            `}
        </div>
    `;
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
            headers: { 'Authorization': `Bearer ${token}` }, 
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
        await apiFetch(`/gallery/${id}`, { method: 'DELETE' });
        renderGallery();
    } catch(e) { alert('Failed to delete photo.'); }
}

// Map Globally
window.submitGalleryPhoto = submitGalleryPhoto;
window.deleteGalleryPhoto = deleteGalleryPhoto;



async function renderStudyMaterials() {
    const userRole = JSON.parse(localStorage.getItem('user')).role;
    const materials = await apiFetch('/study-materials');
    const container = document.getElementById('dynamicContent');
    
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">SQUADRON STUDY MATERIALS & NOTES</p>
        </div>
    `;

    if (userRole !== 'Student') {
        html += `
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
        `;
    }

    html += `<div id="studyList" style="display: flex; flex-direction: column; gap: 1rem;">`;

    html += materials.length ? materials.map(m => `
        <div class="stat-card" style="background: white; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--iaf-saffron);">
            <div>
                <p style="font-weight: 800; color: var(--iaf-blue); font-size: 1.1rem;">${m.title}</p>
                <p style="font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 5px;">
                    UPLOADED BY: ${m.uploader_name ? m.uploader_name.toUpperCase() : 'ADMIN'} | DATE: ${new Date(m.created_at).toLocaleDateString()}
                </p>
            </div>
            <div style="display: flex; gap: 1rem;">
                <a href="${m.file_path}" target="_blank" class="btn btn-accent" style="padding: 0.5rem 1.5rem; border-radius: 6px;">DOWNLOAD PDF</a>
                ${userRole !== 'Student' ? `<button class="btn" style="background: #fee2e2; color: #b91c1c; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;" onclick="deleteStudyMaterial(${m.id})">DELETE</button>` : ''}
            </div>
        </div>`).join('') : '<div class="glass-card" style="text-align: center; color: #64748b;">No study materials available at the moment.</div>';

    html += `</div>`;
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
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
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
        const res = await apiFetch(`/study-materials/${id}`, { method: 'DELETE' });
        alert(res.message || "Deleted!");
        renderStudyMaterials();
    } catch (e) {
        alert("Delete failed.");
    }
}
