const fs = require('fs');

const path = 'c:\\Users\\admin\\Desktop\\ncc\\public\\js\\dashboard.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Inject links into loadView switch
content = content.replace(
    "case 'verify-docs': renderVerifyDocs(); break;",
    "case 'verify-docs': renderVerifyDocs(); break;\n        case 'quartermaster': renderQuartermaster(); break;\n        case 'my-gear': renderMyGear(); break;"
);

// 2. Append new functions
const newCode = `

async function renderQuartermaster() {
    const container = document.getElementById('dynamicContent');
    container.innerHTML = '<p>Loading Quartermaster...</p>';
    
    let inventory = [], cadets = [];
    try {
        const [invData, cadData] = await Promise.all([
            apiFetch('/inventory'),
            apiFetch('/cadets/all')
        ]);
        inventory = invData; cadets = cadData;
    } catch(e) { console.error("Error loading quartermaster data"); }

    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">QUARTERMASTER EQUIPMENT LOG</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div class="glass-card" style="background: white;">
                <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Current Stock</h3>
                <table class="table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #f1f5f9; text-align: left; color: #64748b;">
                            <th>Item Name</th>
                            <th>Available / Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${inventory.map(i => \`
                            <tr style="border-bottom: 1px solid #f8fafc;">
                                <td style="padding: 1rem 0; font-weight: 600; color: var(--iaf-blue);">\${i.item_name}</td>
                                <td style="padding: 1rem 0;">
                                    <span style="color: \${i.available_quantity > 0 ? 'var(--iaf-green)' : '#ef4444'}; font-weight: 800;">\${i.available_quantity}</span> 
                                    <span style="color: #94a3b8;">/ \${i.total_quantity}</span>
                                </td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            </div>

            <div>
                <div class="glass-card" style="background: white; margin-bottom: 2rem;">
                    <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Issue Gear</h3>
                    <div class="form-group">
                        <label>Select Item</label>
                        <select id="qmItemId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                            \${inventory.filter(i => i.available_quantity > 0).map(i => \`<option value="\${i.id}">\${i.item_name} (Avail: \${i.available_quantity})</option>\`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Issue To (Cadet)</label>
                        <select id="qmCadetId" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                            \${cadets.map(c => \`<option value="\${c.id}">\${c.name} (\${c.cadet_id})</option>\`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Date Issued</label>
                        <input type="date" id="qmIssueDate" value="\${new Date().toISOString().split('T')[0]}" style="width: 100%; padding: 0.8rem; border-radius: 8px; border: 1px solid #ddd;">
                    </div>
                    <button class="btn btn-primary" style="width: 100%; font-weight: 800;" onclick="submitIssueGear()">ISSUE ITEM</button>
                    <button class="btn btn-secondary" style="width: 100%; font-weight: 800; margin-top: 0.5rem; background: #f1f5f9; color: var(--iaf-blue);" onclick="submitReturnGear()">LOG RETURN</button>
                </div>

                <div class="glass-card" style="background: white;">
                    <h3 style="color: var(--iaf-blue); margin-bottom: 1.5rem;">Procure New Stock</h3>
                    <div class="form-group">
                        <label>Item Name (e.g. Beret Size L)</label>
                        <input type="text" id="qmNewName" style="padding: 0.8rem; width: 100%; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    <div class="form-group">
                        <label>Quantity to Procure</label>
                        <input type="number" id="qmNewQty" value="1" min="1" style="padding: 0.8rem; width: 100%; border: 1px solid #ddd; border-radius: 8px;">
                    </div>
                    <button class="btn btn-primary" style="width: 100%; background: var(--iaf-saffron); font-weight: 800;" onclick="submitNewStock()">ADD TO ARMORY</button>
                </div>
            </div>
        </div>
    \`;
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

async function submitIssueGear() {
    const itemId = document.getElementById('qmItemId').value;
    const cadetId = document.getElementById('qmCadetId').value;
    const date = document.getElementById('qmIssueDate').value;
    if(!itemId || !cadetId || !date) return alert('Fill all fields to issue gear.');

    try {
        await apiFetch('/inventory/issue', {
            method: 'POST',
            body: JSON.stringify({ item_id: itemId, cadet_id: cadetId, issue_date: date })
        });
        alert('Gear Issued to Cadet Successfully');
        renderQuartermaster();
    } catch(e) { alert('Error issuing gear (possibly out of stock)'); }
}

async function submitReturnGear() {
    const issueId = prompt("Enter the exact Issue ID # to log a return:");
    if(!issueId) return;

    try {
        await apiFetch(\`/inventory/return/\${issueId}\`, {
            method: 'POST'
        });
        alert('Gear returned to Armory Successfully');
        renderQuartermaster();
    } catch(e) { alert('Error returning gear. Invalid ID or already returned.'); }
}

async function renderMyGear() {
    const container = document.getElementById('dynamicContent');
    const gear = await apiFetch('/inventory/mygear');

    container.innerHTML = \`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <p style="color: #64748b; font-weight: 600;">MY ISSUED EQUIPMENT</p>
        </div>
        <div class="glass-card" style="background: white;">
            \${gear.length === 0 ? '<p style="color: #94a3b8; text-align: center; padding: 2rem;">No equipment currently issued to you.</p>' : \`
                <table style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid #f1f5f9; color: #64748b;">
                            <th style="padding-bottom: 1rem;">Item Name</th>
                            <th style="padding-bottom: 1rem;">Date Issued</th>
                            <th style="padding-bottom: 1rem;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        \${gear.map(g => \`
                            <tr style="border-bottom: 1px solid #f8fafc;">
                                <td style="padding: 1.5rem 0; font-weight: 600; color: var(--iaf-blue);">\${g.item_name}</td>
                                <td style="padding: 1.5rem 0; color: #64748b;">\${new Date(g.issue_date).toLocaleDateString()}</td>
                                <td style="padding: 1.5rem 0;">
                                    <span style="padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: \${g.status === 'Issued' ? '#dcfce7' : '#f1f5f9'}; color: \${g.status === 'Issued' ? '#166534' : '#64748b'};">
                                        \${g.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        \`).join('')}
                    </tbody>
                </table>
            \`}
        </div>
    \`;
}

// Map globally
window.submitNewStock = submitNewStock;
window.submitIssueGear = submitIssueGear;
window.submitReturnGear = submitReturnGear;

`;

// Append to the bottom securely
fs.writeFileSync(path, content + newCode);
console.log("Appended quartermaster code");
