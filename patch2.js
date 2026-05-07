const fs = require('fs');

const path = 'c:\\Users\\admin\\Desktop\\ncc\\public\\js\\dashboard.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject links into loadView switch
content = content.replace(
    "case 'my-gear': renderMyGear(); break;",
    "case 'my-gear': renderMyGear(); break;\n        case 'admin-assessments': renderAdminAssessments(); break;\n        case 'my-assessments': renderMyAssessments(); break;"
);

// 2. Append new functions
const newCode = `

async function renderAdminAssessments() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = '<p>Loading Assessments...</p>';
    
    let cadets = [];
    try { cadets = await apiFetch('/cadets/all'); } catch(e) {}

    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">TACTICAL EXAM ASSESSMENTS</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="glass-card" style="background: white;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Log Squad Marks</h3>
                <div class="form-group">
                    <label>Select Cadet</label>
                    <select id="asmCadetId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                        \${cadets.map(c => \`<option value="\${c.id}">\${c.name} (\${c.cadet_id})</option>\`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Assessment Title (e.g. Drill Test A, Firing Range)</label>
                    <input type="text" id="asmTitle" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <div class="form-group" style="flex: 1;">
                        <label>Cadet Score</label>
                        <input type="number" id="asmScore" min="0" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Maximum Score</label>
                        <input type="number" id="asmMaxScore" min="1" value="100" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                </div>
                <div class="form-group">
                    <label>Date Conducted</label>
                    <input type="date" id="asmDate" value="\${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                </div>
                <button class="btn btn-primary" style="width: 100%; font-weight: 800; background: var(--iaf-blue); color: white;" onclick="submitAssessment()">AUTHORIZE SCORE</button>
            </div>

            <div class="glass-card" style="background: var(--iaf-blue); color: white;">
                <h3 style="color: white; margin-bottom: 1.5rem;">Check Cadet History</h3>
                <div class="form-group">
                    <label style="color: #94a3b8;">Review Individual Cadet Performance</label>
                    <select id="asmHistoryCadetId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white;" onchange="loadCadetAssessmentHistory()">
                        <option value="">-- SELECT CADET --</option>
                        \${cadets.map(c => \`<option value="\${c.id}">\${c.name}</option>\`).join('')}
                    </select>
                </div>
                <div id="asmHistoryDisplay" style="margin-top: 2rem; max-height: 300px; overflow-y: auto;">
                    <p style="color: #94a3b8; font-size: 0.85rem;">Select a cadet above to view their exam logs.</p>
                </div>
            </div>
        </div>
    \`;
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
        const scores = await apiFetch(\`/assessments/cadet/\${cadetId}\`);
        if(scores.length === 0) {
           display.innerHTML = '<p style="color: var(--iaf-saffron);">No history found for this cadet.</p>';
        } else {
           display.innerHTML = scores.map(s => \`
              <div style="background: rgba(255,255,255,0.05); padding: 1rem; margin-bottom: 1rem; border-radius: 8px; border-left: 3px solid \${(s.score/s.max_score) >= 0.5 ? 'var(--iaf-green)' : '#ef4444'};">
                  <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 800; font-size: 1.1rem;">\${s.assessment_title}</span>
                      <span style="font-weight: 900; color: \${(s.score/s.max_score) >= 0.5 ? 'var(--iaf-green)' : '#ef4444'};">\${s.score} / \${s.max_score}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 0.5rem;">\${new Date(s.date).toLocaleDateString()}</div>
              </div>
           \`).join('');
        }
    } catch(e) {
        display.innerHTML = '<p style="color: red;">Error fetching history.</p>';
    }
}

async function renderMyAssessments() {
    const container = document.getElementById('dynamicContent');
    const scores = await apiFetch('/assessments/myscores');

    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">MY TACTICAL MARKS</p>
        </div>
        <div class="glass-card" style="background: white;">
            \${scores.length === 0 ? '<p style="color: #94a3b8; text-align: center; padding: 2rem;">Your examiner has not uploaded any scores yet.</p>' : \`
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    \${scores.map(s => {
                        const percent = (s.score / s.max_score) * 100;
                        const passColor = percent >= 50 ? 'var(--iaf-green)' : '#ef4444';
                        return \`
                            <div style="border: 1px solid #f1f5f9; border-radius: 12px; padding: 1.5rem; border-top: 4px solid \${passColor};">
                                <h4 style="color: var(--iaf-blue); margin-bottom: 0.5rem; text-transform: uppercase;">\${s.assessment_title}</h4>
                                <p style="color: #64748b; font-size: 0.8rem; margin-bottom: 1.5rem;">\${new Date(s.date).toLocaleDateString()}</p>
                                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                    <span style="font-size: 2.5rem; font-weight: 900; color: \${passColor};">\${s.score}</span>
                                    <span style="font-size: 1.2rem; font-weight: 600; color: #94a3b8;">/ \${s.max_score}</span>
                                </div>
                                <div style="margin-top: 1rem; width: 100%; background: #f1f5f9; height: 8px; border-radius: 4px; overflow: hidden;">
                                    <div style="width: \${percent}%; background: \${passColor}; height: 100%;"></div>
                                </div>
                            </div>
                        \`;
                    }).join('')}
                </div>
            \`}
        </div>
    \`;
}

// Map globally
window.submitAssessment = submitAssessment;
window.loadCadetAssessmentHistory = loadCadetAssessmentHistory;

`;

// Append to the bottom securely
fs.writeFileSync(path, content + newCode);
console.log("Appended assessment code");
