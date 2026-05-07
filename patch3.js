const fs = require('fs');
const path = require('path');

const jsPath = 'c:\\Users\\admin\\Desktop\\ncc\\public\\js\\dashboard.js';
const serverPath = 'c:\\Users\\admin\\Desktop\\ncc\\server.js';

// 1. Mount Server Route
let serverContent = fs.readFileSync(serverPath, 'utf8');
serverContent = serverContent.replace(
    "app.use('/api/assessments', require('./routes/assessmentRoutes'));",
    "app.use('/api/assessments', require('./routes/assessmentRoutes'));\napp.use('/api/pt', require('./routes/ptRoutes'));"
);
fs.writeFileSync(serverPath, serverContent);

// 2. Inject JS Router
let jsContent = fs.readFileSync(jsPath, 'utf8');
jsContent = jsContent.replace(
    "case 'my-assessments': renderMyAssessments(); break;",
    "case 'my-assessments': renderMyAssessments(); break;\n        case 'admin-pt': renderAdminPT(); break;\n        case 'my-pt': renderMyPT(); break;"
);

// 3. Inject JS Logic
const newCode = `

async function renderAdminPT() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = '<p>Loading PT Module...</p>';
    
    let cadets = [];
    try { cadets = await apiFetch('/cadets/all'); } catch(e) {}

    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">PHYSICAL FITNESS (PT) COMMAND TRACKER</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <!-- Input Form -->
            <div class="glass-card" style="background: white;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Log Monthly PT Stats</h3>
                <div class="form-group">
                    <label>Select Cadet</label>
                    <select id="ptCadetId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                        \${cadets.map(c => \`<option value="\${c.id}">\${c.name} (\${c.cadet_id})</option>\`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Evaluation Month</label>
                    <select id="ptMonth" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                    </select>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>1.6km Run (MM:SS)</label>
                        <input type="text" id="ptRunTime" placeholder="06:30" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                    <div class="form-group">
                        <label>Pushups (Count)</label>
                        <input type="number" id="ptPushups" min="0" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label>Situps (Count)</label>
                        <input type="number" id="ptSitups" min="0" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                    <div class="form-group">
                        <label>Date Conducted</label>
                        <input type="date" id="ptDate" value="\${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 1rem; font-weight: 800; background: var(--iaf-green);" onclick="submitPT()">SAVE FITNESS LOG</button>
            </div>

            <!-- Global Logs -->
            <div class="glass-card" style="background: var(--iaf-saffron); color: white;">
                <h3 style="color: white; margin-bottom: 1.5rem;">Squadron Recent Logs</h3>
                <div id="ptGlobalLogs" style="max-height: 400px; overflow-y: auto;">
                    <p>Loading records...</p>
                </div>
            </div>
        </div>
    \`;

    // Fetch and populate list
    setTimeout(loadPTGlobalLogs, 100);
}

async function submitPT() {
    const payload = {
        cadet_id: document.getElementById('ptCadetId').value,
        month: document.getElementById('ptMonth').value,
        run_time: document.getElementById('ptRunTime').value,
        pushups: document.getElementById('ptPushups').value,
        situps: document.getElementById('ptSitups').value,
        date_logged: document.getElementById('ptDate').value
    };

    if(!payload.run_time || !payload.pushups || !payload.situps) return alert('Enter full fitness stats.');

    try {
        await apiFetch('/pt/log', { method: 'POST', body: JSON.stringify(payload) });
        alert('PT Stats saved safely!');
        renderAdminPT();
    } catch(e) { alert('Failed to save PT log.'); }
}

async function loadPTGlobalLogs() {
    const list = document.getElementById('ptGlobalLogs');
    try {
        const logs = await apiFetch('/pt/all');
        if(logs.length === 0) {
            list.innerHTML = '<p style="color: rgba(255,255,255,0.8);">No historic PT data recorded.</p>';
            return;
        }
        list.innerHTML = logs.map(l => \`
            <div style="background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 8px; margin-bottom: 0.8rem;">
                <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 0.5rem; margin-bottom: 0.5rem;">
                    <span style="font-weight: 800; font-size: 1.1rem;">\${l.name} (\${l.official_id})</span>
                    <span style="font-weight: 800; background: \${l.overall_grade === 'Fail' ? 'red' : 'rgba(0,0,0,0.2)'}; padding: 0.2rem 0.5rem; border-radius: 5px;">\${l.overall_grade}</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); font-size: 0.85rem;">
                    <div>⏱️ \${l.run_time}</div>
                    <div>💪 \${l.pushups} PU</div>
                    <div>🤸 \${l.situps} SU</div>
                </div>
            </div>
        \`).join('');
    } catch(e) {
        list.innerHTML = '<p>Error loading records.</p>';
    }
}

async function renderMyPT() {
    const container = document.getElementById('dynamicContent');
    const logs = await apiFetch('/pt/mylogs');

    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">MY FITNESS PROGRESSION</p>
        </div>
        
        <div class="glass-card" style="background: white;">
            \${logs.length === 0 ? '<p style="color: #94a3b8; text-align: center; padding: 2rem;">Physical fitness logs have not been recorded by your instructor yet.</p>' : \`
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 2px solid #f1f5f9; color: var(--iaf-blue);">
                                <th style="padding: 1rem;">Month</th>
                                <th style="padding: 1rem;">Date</th>
                                <th style="padding: 1rem;">1.6km Run</th>
                                <th style="padding: 1rem;">Pushups</th>
                                <th style="padding: 1rem;">Situps</th>
                                <th style="padding: 1rem;">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${logs.map(l => \`
                                <tr style="border-bottom: 1px solid #f8fafc;">
                                    <td style="padding: 1rem; font-weight: 800; color: #64748b;">\${l.month.toUpperCase()}</td>
                                    <td style="padding: 1rem;">\${new Date(l.date_logged).toLocaleDateString()}</td>
                                    <td style="padding: 1rem; font-weight: 600;">⏱️ \${l.run_time}</td>
                                    <td style="padding: 1rem; font-weight: 600;">\${l.pushups}</td>
                                    <td style="padding: 1rem; font-weight: 600;">\${l.situps}</td>
                                    <td style="padding: 1rem;">
                                        <span style="font-weight: 800; color: \${l.overall_grade === 'Fail' ? '#ef4444' : 'var(--iaf-green)'};">
                                            \${l.overall_grade.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                </div>
            \`}
        </div>
    \`;
}

// Map Globally
window.submitPT = submitPT;
window.loadPTGlobalLogs = loadPTGlobalLogs;

`;

fs.writeFileSync(jsPath, jsContent + newCode);
console.log("Appended PT tracker code");
