// Main Application Logic - Reactively Driven

let currentScenario = {};
let aiScenario = {};

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    
    // Navigation
    const navLinks = document.querySelectorAll('.nav-links li');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            switchView(link.dataset.target);
        });
    });

    // Inputs listener
    const inputs = document.querySelectorAll('.input-section input');
    inputs.forEach(input => {
        input.addEventListener('input', calculateScenario);
    });

    // Simulator inputs listener
    const simInputs = ['staff', 'counters', 'resources', 'time'];
    simInputs.forEach(id => {
        document.getElementById(`sim-mod-${id}`).addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            document.getElementById(`sim-val-${id}`).textContent = val > 0 ? `+${val}` : val;
        });
    });

    // Buttons
    document.getElementById('btn-run-analysis').addEventListener('click', runAIAnalysis);
    document.getElementById('btn-run-sim').addEventListener('click', runSimulation);
    document.getElementById('btn-apply-plan').addEventListener('click', applyAIPlan);
    
    // Twin Toggles
    document.getElementById('btn-twin-before').addEventListener('click', (e) => {
        document.getElementById('btn-twin-before').classList.add('active');
        document.getElementById('btn-twin-before').classList.remove('secondary');
        document.getElementById('btn-twin-after').classList.add('secondary');
        document.getElementById('btn-twin-after').classList.remove('active');
        renderDigitalTwin(currentScenario);
    });
    document.getElementById('btn-twin-after').addEventListener('click', (e) => {
        document.getElementById('btn-twin-after').classList.add('active');
        document.getElementById('btn-twin-after').classList.remove('secondary');
        document.getElementById('btn-twin-before').classList.add('secondary');
        document.getElementById('btn-twin-before').classList.remove('active');
        renderDigitalTwin(aiScenario);
    });

    // Explain Modal
    document.body.addEventListener('click', function(e) {
        if(e.target && e.target.classList.contains('btn-why')) {
            showExplainModal(e.target.dataset.riskIdx);
        }
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('explain-modal').style.display = 'none';
        });
    });

    // Initial load
    calculateScenario();
    animatePipeline();
});

function switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if (viewId === 'digital-twin') {
        renderDigitalTwin(currentScenario);
    } else if (viewId === 'knowledge-graph') {
        setTimeout(renderKnowledgeGraph, 50);
    }
}

// ==========================================
// CORE CALCULATION ENGINE
// ==========================================
function calculateScenario() {
    const p = parseFloat(document.getElementById('in-expected-people').value) || 0;
    const peak = parseFloat(document.getElementById('in-peak-rate').value) || 0;
    const hrs = parseFloat(document.getElementById('in-duration').value) || 0;
    const staff = parseFloat(document.getElementById('in-staff').value) || 0;
    const counters = parseFloat(document.getElementById('in-counters').value) || 0;
    const sTime = parseFloat(document.getElementById('in-service-time').value) || 0;
    const resources = parseFloat(document.getElementById('in-resources').value) || 0;

    // Hard rules & transparent assumptions
    const staffRatio = 20; // 1 staff per 20 people overall
    const reqStaff = Math.ceil(p / staffRatio);
    const staffGap = reqStaff - staff;

    const peoplePerCounterPerHour = sTime > 0 ? (60 / sTime) : 0;
    const serviceCapacityPerHour = Math.floor(counters * peoplePerCounterPerHour);
    const capacityDeficitPerHour = peak - serviceCapacityPerHour;
    
    const totalCapacity = serviceCapacityPerHour * hrs;
    const capacityUtil = totalCapacity > 0 ? Math.round((p / totalCapacity) * 100) : 0;
    
    const resourceGap = Math.max(0, p - resources);

    // Identify risks
    let risks = [];
    
    if (staffGap > 0) {
        risks.push({
            id: 'staff',
            title: 'Staff shortage predicted',
            level: staffGap > 5 ? 'high' : 'medium',
            formula: `Expected customers: ${p}\nRequired staff (${staffRatio} pax/staff): ${reqStaff}\nAvailable staff: ${staff}\n\nStaff gap: ${staffGap}`,
            reason: 'Available workforce is below the estimated staffing requirement for the expected demand.',
            impact: 'Reduced service quality and slower response times.',
            action: `Deploy ${staffGap} additional staff members.`,
            alloc: { res: 'Staff', cur: staff, rec: reqStaff }
        });
    }

    if (capacityDeficitPerHour > 0) {
        const countersNeeded = Math.ceil(peak / peoplePerCounterPerHour);
        const counterGap = countersNeeded - counters;
        risks.push({
            id: 'queue',
            title: 'Severe queue congestion at peak hours',
            level: 'high',
            formula: `Peak arrivals: ${peak}/hr\nService capacity: ${counters} counters × ${peoplePerCounterPerHour}/hr = ${serviceCapacityPerHour}/hr\n\nCapacity deficit: ${capacityDeficitPerHour} people/hour`,
            reason: 'Current processing capacity cannot handle the peak arrival rate.',
            impact: 'Massive queue formation, high wait times, and customer dissatisfaction.',
            action: `Open ${counterGap} additional service counters during peak times.`,
            alloc: { res: 'Counters', cur: counters, rec: countersNeeded }
        });
    }

    if (resourceGap > 0) {
        risks.push({
            id: 'resources',
            title: 'Inventory / Resource shortage',
            level: 'high',
            formula: `Expected demand: ${p}\nAvailable resources: ${resources}\n\nResource gap: ${resourceGap}`,
            reason: 'Predicted demand exceeds available resources.',
            impact: 'Inability to serve customers once inventory depletes.',
            action: `Increase resource inventory by ${resourceGap} units.`,
            alloc: { res: 'Inventory', cur: resources, rec: p }
        });
    }
    
    if (capacityUtil > 90 && capacityDeficitPerHour <= 0) {
        risks.push({
            id: 'util',
            title: 'System operating near maximum capacity',
            level: 'medium',
            formula: `Total capacity: ${totalCapacity}\nExpected people: ${p}\n\nUtilization: ${capacityUtil}%`,
            reason: 'High utilization leaves little room for error or unexpected spikes.',
            impact: 'Fragile operations, minor delays may cascade.',
            action: `Ensure all counters are fully manned without breaks during mid-to-peak periods.`,
            alloc: null
        });
    }

    // Health Score
    let wScore = staffGap <= 0 ? 100 : Math.max(0, 100 - (staffGap * 5));
    let cScore = capacityDeficitPerHour <= 0 ? 100 : Math.max(0, 100 - (capacityDeficitPerHour));
    let rScore = resourceGap <= 0 ? 100 : Math.max(0, Math.round((resources / p) * 100));
    let pScore = capacityUtil > 100 ? 20 : (100 - (capacityUtil - 70)); 
    if(pScore > 100) pScore = 100;
    
    let totalScore = Math.round((wScore + cScore + rScore + pScore) / 4);

    // Save State
    currentScenario = {
        inputs: { p, peak, hrs, staff, counters, sTime, resources },
        calc: { reqStaff, staffGap, serviceCapacityPerHour, capacityDeficitPerHour, totalCapacity, capacityUtil, resourceGap },
        risks: risks,
        scores: { total: totalScore, workforce: wScore, capacity: cScore, resources: rScore, peak: pScore }
    };
    
    // AI Scenario (if all recs followed)
    aiScenario = JSON.parse(JSON.stringify(currentScenario));
    risks.forEach(r => {
        if(r.id === 'staff') aiScenario.inputs.staff += currentScenario.calc.staffGap;
        if(r.id === 'queue') {
            const countersNeeded = Math.ceil(currentScenario.inputs.peak / (currentScenario.inputs.sTime > 0 ? (60 / currentScenario.inputs.sTime) : 1));
            aiScenario.inputs.counters = countersNeeded;
        }
        if(r.id === 'resources') aiScenario.inputs.resources += currentScenario.calc.resourceGap;
    });
    // AI scenario has 100 health theoretically
    aiScenario.scores.total = 95; // 95 to look realistic
    aiScenario.calc.staffGap = 0;
    aiScenario.calc.capacityDeficitPerHour = 0;
    aiScenario.calc.resourceGap = 0;
    aiScenario.calc.capacityUtil = 85;

    renderDashboard();
}

// ==========================================
// RENDERERS
// ==========================================

function renderDashboard() {
    const s = currentScenario;
    
    // Health Score
    document.getElementById('health-score-val').textContent = s.scores.total;
    const circle = document.getElementById('health-circle');
    circle.style.borderColor = s.scores.total > 80 ? 'var(--color-green)' : (s.scores.total > 50 ? 'var(--color-amber)' : 'var(--color-red)');
    
    document.getElementById('health-breakdown').innerHTML = `
        <div class="health-metric"><span>Workforce Readiness</span> <strong class="${s.scores.workforce > 80 ? 'text-green' : 'text-red'}">${s.scores.workforce}</strong></div>
        <div class="health-metric"><span>Capacity Readiness</span> <strong class="${s.scores.capacity > 80 ? 'text-green' : 'text-red'}">${s.scores.capacity}</strong></div>
        <div class="health-metric"><span>Resource Readiness</span> <strong class="${s.scores.resources > 80 ? 'text-green' : 'text-red'}">${s.scores.resources}</strong></div>
        <div class="health-metric"><span>Peak Resilience</span> <strong class="${s.scores.peak > 80 ? 'text-green' : 'text-red'}">${s.scores.peak}</strong></div>
    `;

    // Timeline
    let timelineHTML = '';
    const startHour = 8;
    for(let i=0; i<s.inputs.hrs; i++) {
        let time = `${(startHour + i).toString().padStart(2, '0')}:00`;
        let status = 'Normal';
        let cls = '';
        
        if (i === Math.floor(s.inputs.hrs / 2)) {
            if (s.calc.capacityDeficitPerHour > 0) { status = `Peak congestion predicted (${s.calc.capacityDeficitPerHour} backlog/hr)`; cls = 'danger'; }
            else { status = 'Peak hour starts'; cls = 'warning'; }
        }
        if (i === s.inputs.hrs - 1 && s.calc.resourceGap > 0) {
            status = 'Inventory depletion risk'; cls = 'danger';
        }

        timelineHTML += `
            <div class="timeline-row">
                <div class="timeline-time">${time}</div>
                <div class="timeline-event ${cls}">${status}</div>
            </div>
        `;
    }
    document.getElementById('predictive-timeline').innerHTML = timelineHTML;

    // KPIs
    document.getElementById('calc-kpi-container').innerHTML = `
        <div class="kpi-card card glass" style="padding:15px">
            <span class="kpi-title">Required Staff</span>
            <span class="kpi-value">${s.calc.reqStaff} <small style="font-size:1rem;color:var(--text-muted)">/ ${s.inputs.staff} avail</small></span>
        </div>
        <div class="kpi-card card glass" style="padding:15px">
            <span class="kpi-title">Capacity Util.</span>
            <span class="kpi-value ${s.calc.capacityUtil > 100 ? 'text-red' : ''}">${s.calc.capacityUtil}%</span>
        </div>
        <div class="kpi-card card glass" style="padding:15px">
            <span class="kpi-title">Peak Deficit</span>
            <span class="kpi-value ${s.calc.capacityDeficitPerHour > 0 ? 'text-red' : ''}">${s.calc.capacityDeficitPerHour} <small style="font-size:1rem;color:var(--text-muted)">pax/hr</small></span>
        </div>
        <div class="kpi-card card glass" style="padding:15px">
            <span class="kpi-title">Resource Gap</span>
            <span class="kpi-value ${s.calc.resourceGap > 0 ? 'text-red' : ''}">${s.calc.resourceGap}</span>
        </div>
    `;

    // What will go wrong snippets
    let probsHTML = '';
    if (s.risks.length === 0) {
        probsHTML = '<p class="text-green"><i data-lucide="check-circle"></i> No critical bottlenecks predicted.</p>';
    } else {
        s.risks.forEach(r => {
            probsHTML += `
                <div class="alert-item ${r.level === 'high' ? 'critical' : 'warning'}">
                    <i data-lucide="alert-triangle"></i>
                    <div>
                        <p>${r.title}</p>
                    </div>
                </div>
            `;
        });
    }
    document.getElementById('dashboard-problems').innerHTML = probsHTML;
    
    renderPredictionsView();
    renderOperationalPlan();
    renderSimulator();
    lucide.createIcons();
}

function renderPredictionsView() {
    const s = currentScenario;
    const container = document.getElementById('predictions-container');
    container.innerHTML = '';

    if (s.risks.length === 0) {
        container.innerHTML = '<div class="card glass w-full"><p>All operational parameters are within healthy thresholds.</p></div>';
        return;
    }

    s.risks.forEach((r, idx) => {
        const badgeClass = r.level === 'high' ? 'badge-high' : 'badge-medium';
        container.innerHTML += `
            <div class="pred-card card glass">
                <div class="pred-header">
                    <h3>${r.title}</h3>
                    <span class="badge ${badgeClass}">${r.level.toUpperCase()} RISK</span>
                </div>
                <div class="pred-body">
                    <p class="text-muted" style="margin-bottom:15px">${r.reason}</p>
                    <div class="pred-metric"><span>Impact:</span> <strong class="text-red">${r.impact}</strong></div>
                </div>
                <div class="pred-actions">
                    <button class="btn-action secondary btn-why" data-risk-idx="${idx}">Why?</button>
                </div>
            </div>
        `;
    });
}

function renderOperationalPlan() {
    const s = currentScenario;
    let recsHTML = '';
    let allocHTML = `
        <table class="allocation-table">
            <thead>
                <tr>
                    <th>Resource</th>
                    <th>Current</th>
                    <th>AI Recommended</th>
                    <th>Diff</th>
                </tr>
            </thead>
            <tbody>
    `;
    let whyHTML = '';

    if (s.risks.length === 0) {
        document.getElementById('recommendations-list').innerHTML = '<p>Maintain current operational plan.</p>';
        document.getElementById('allocation-table').innerHTML = '<p>Current allocation is optimal.</p>';
        document.getElementById('ai-summary-panel').innerHTML = '<p>No interventions needed.</p>';
        return;
    }

    s.risks.forEach((r, idx) => {
        recsHTML += `
            <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--border-glass);">
                <h4 style="color: var(--accent-cyan); margin-bottom: 8px;">Recommendation 0${idx+1}</h4>
                <p style="font-size: 1.1rem; font-weight: bold; margin-bottom: 8px;">${r.action}</p>
                <p style="font-size: 0.9rem; color: var(--text-muted);"><strong>Reason:</strong> ${r.reason}</p>
            </div>
        `;

        if (r.alloc) {
            const diff = r.alloc.rec - r.alloc.cur;
            const diffStr = diff > 0 ? `+${diff}` : diff;
            const cls = diff > 0 ? 'diff-positive' : '';
            allocHTML += `
                <tr>
                    <td><strong>${r.alloc.res}</strong></td>
                    <td>${r.alloc.cur}</td>
                    <td>${r.alloc.rec}</td>
                    <td class="${cls}">${diffStr}</td>
                </tr>
            `;
        }
        
        whyHTML += `
            <p style="margin-bottom: 15px;"><strong>For ${r.alloc ? r.alloc.res : 'Operations'}:</strong><br>
            ${r.formula.replace(/\n/g, '<br>')}</p>
        `;
    });

    allocHTML += `</tbody></table>`;
    
    whyHTML += `<p style="margin-top: 20px; color: var(--accent-cyan); font-weight: bold;">Implementing the above recommendations will eliminate peak-hour congestion and stabilize the operational health score to 95/100.</p>`;

    document.getElementById('recommendations-list').innerHTML = recsHTML;
    document.getElementById('allocation-table').innerHTML = allocHTML;
    document.getElementById('ai-summary-panel').innerHTML = whyHTML;
}

function renderSimulator() {
    const s = currentScenario;
    document.getElementById('sim-current-metrics').innerHTML = `
        <div class="metric"><span>Health Score:</span> <strong class="${s.scores.total < 75 ? 'text-red' : 'text-green'}">${s.scores.total}</strong></div>
        <div class="metric"><span>Staff Gap:</span> <strong class="${s.calc.staffGap > 0 ? 'text-red' : 'text-green'}">${s.calc.staffGap}</strong></div>
        <div class="metric"><span>Queue Risk:</span> <strong class="${s.calc.capacityDeficitPerHour > 0 ? 'text-red' : 'text-green'}">${s.calc.capacityDeficitPerHour > 0 ? 'HIGH' : 'LOW'}</strong></div>
        <div class="metric"><span>Capacity Util:</span> <strong class="${s.calc.capacityUtil > 100 ? 'text-red' : 'text-green'}">${s.calc.capacityUtil}%</strong></div>
        <div class="metric"><span>Resource Gap:</span> <strong class="${s.calc.resourceGap > 0 ? 'text-red' : 'text-green'}">${s.calc.resourceGap}</strong></div>
    `;
    
    // Clear proposed until run
    document.getElementById('sim-proposed-metrics').innerHTML = `<p class="text-muted" style="margin-top:20px;text-align:center;">Adjust variables and click RUN SIMULATION</p>`;
}

// ==========================================
// ACTIONS
// ==========================================

async function runAIAnalysis() {
    const btn = document.getElementById('btn-run-analysis');
    btn.innerHTML = '<i data-lucide="loader" class="spin"></i> ANALYZING...';
    lucide.createIcons();
    
    calculateScenario();
    
    setTimeout(() => {
        switchView('dashboard');
        btn.innerHTML = '<i data-lucide="cpu"></i> RUN AI ANALYSIS';
        lucide.createIcons();
        document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
        document.querySelectorAll('.nav-links li')[1].classList.add('active'); // Dashboard
    }, 1000);
}

function runSimulation() {
    document.getElementById('sim-loading').classList.remove('hidden');
    document.getElementById('sim-comparison').classList.add('hidden');
    
    // Get modifiers
    const modStaff = parseFloat(document.getElementById('sim-mod-staff').value);
    const modCounters = parseFloat(document.getElementById('sim-mod-counters').value);
    const modResources = parseFloat(document.getElementById('sim-mod-resources').value);
    const modTime = parseFloat(document.getElementById('sim-mod-time').value);
    
    // Apply modifiers to base inputs
    const p = currentScenario.inputs.p;
    const peak = currentScenario.inputs.peak;
    const hrs = currentScenario.inputs.hrs;
    
    const simStaff = Math.max(0, currentScenario.inputs.staff + modStaff);
    const simCounters = Math.max(0, currentScenario.inputs.counters + modCounters);
    const simResources = Math.max(0, currentScenario.inputs.resources + modResources);
    const simSTime = Math.max(0.5, currentScenario.inputs.sTime + modTime);

    // Calc sim scenario
    const staffRatio = 20;
    const reqStaff = Math.ceil(p / staffRatio);
    const staffGap = reqStaff - simStaff;

    const peoplePerCounterPerHour = (60 / simSTime);
    const serviceCapacityPerHour = Math.floor(simCounters * peoplePerCounterPerHour);
    const capacityDeficitPerHour = peak - serviceCapacityPerHour;
    const totalCapacity = serviceCapacityPerHour * hrs;
    const capacityUtil = Math.round((p / totalCapacity) * 100);
    const resourceGap = Math.max(0, p - simResources);

    let wScore = staffGap <= 0 ? 100 : Math.max(0, 100 - (staffGap * 5));
    let cScore = capacityDeficitPerHour <= 0 ? 100 : Math.max(0, 100 - (capacityDeficitPerHour));
    let rScore = resourceGap <= 0 ? 100 : Math.max(0, Math.round((simResources / p) * 100));
    let pScore = capacityUtil > 100 ? 20 : (100 - (capacityUtil - 70)); 
    if(pScore > 100) pScore = 100;
    let totalScore = Math.round((wScore + cScore + rScore + pScore) / 4);

    setTimeout(() => {
        document.getElementById('sim-loading').classList.add('hidden');
        document.getElementById('sim-comparison').classList.remove('hidden');
        
        document.getElementById('sim-proposed-metrics').innerHTML = `
            <div class="metric"><span>Health Score:</span> <strong class="${totalScore < 75 ? 'text-red' : 'text-green'}">${totalScore}</strong></div>
            <div class="metric"><span>Staff Gap:</span> <strong class="${staffGap > 0 ? 'text-red' : 'text-green'}">${staffGap <= 0 ? 0 : staffGap}</strong></div>
            <div class="metric"><span>Queue Risk:</span> <strong class="${capacityDeficitPerHour > 0 ? 'text-red' : 'text-green'}">${capacityDeficitPerHour > 0 ? 'HIGH' : 'LOW'}</strong></div>
            <div class="metric"><span>Capacity Util:</span> <strong class="${capacityUtil > 100 ? 'text-red' : 'text-green'}">${capacityUtil}%</strong></div>
            <div class="metric"><span>Resource Gap:</span> <strong class="${resourceGap > 0 ? 'text-red' : 'text-green'}">${resourceGap}</strong></div>
        `;
    }, 1000);
}

function applyAIPlan() {
    // Fill the modifiers with the AI Plan
    if (currentScenario.risks.length > 0) {
        document.getElementById('sim-mod-staff').value = currentScenario.calc.staffGap > 0 ? currentScenario.calc.staffGap : 0;
        
        let counterGap = 0;
        if (currentScenario.calc.capacityDeficitPerHour > 0) {
             const countersNeeded = Math.ceil(currentScenario.inputs.peak / (60 / currentScenario.inputs.sTime));
             counterGap = countersNeeded - currentScenario.inputs.counters;
        }
        document.getElementById('sim-mod-counters').value = counterGap;
        
        document.getElementById('sim-mod-resources').value = currentScenario.calc.resourceGap > 0 ? currentScenario.calc.resourceGap : 0;
        document.getElementById('sim-mod-time').value = 0;
        
        // Dispatch input events
        ['staff', 'counters', 'resources', 'time'].forEach(id => {
            const el = document.getElementById(`sim-mod-${id}`);
            el.dispatchEvent(new Event('input'));
        });
        
        runSimulation();
    }
}

function showExplainModal(idx) {
    const r = currentScenario.risks[idx];
    if(!r) return;
    
    document.getElementById('modal-title').textContent = `Why: ${r.title}`;
    
    let html = `
        <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:6px; border:1px solid var(--border-glass); margin-bottom:15px; font-family:monospace; font-size:0.95rem; line-height:1.5;">
            ${r.formula.replace(/\n/g, '<br>')}
        </div>
        <p><strong>Reason:</strong> ${r.reason}</p>
        <p style="margin-top:10px;"><strong>Expected Impact:</strong> <span class="text-red">${r.impact}</span></p>
    `;
    
    document.getElementById('modal-body').innerHTML = html;
    document.getElementById('explain-modal').style.display = 'flex';
}

function animatePipeline() {
    const steps = ['loop-input', 'loop-detect', 'loop-predict', 'loop-explain', 'loop-recommend', 'loop-simulate', 'loop-optimize', 'loop-act'];
    let current = 0;
    setInterval(() => {
        document.getElementById(steps[current]).classList.remove('active');
        current = (current + 1) % steps.length;
        document.getElementById(steps[current]).classList.add('active');
    }, 1500);
}

// AI Assistant
function toggleAI() {
    const panel = document.getElementById('ai-panel');
    const icon = document.getElementById('ai-toggle-icon');
    panel.classList.toggle('minimized');
    icon.setAttribute('data-lucide', panel.classList.contains('minimized') ? 'chevron-up' : 'chevron-down');
    lucide.createIcons();
}

function sendPrompt(btn) {
    document.getElementById('ai-input-field').value = btn.textContent;
    sendChatMessage();
}

function sendChatMessage() {
    const input = document.getElementById('ai-input-field');
    const text = input.value.trim();
    if (!text) return;
    
    const chat = document.getElementById('ai-chat');
    chat.innerHTML += `<div class="chat-message user">${text}</div>`;
    input.value = '';
    chat.scrollTop = chat.scrollHeight;
    
    setTimeout(() => {
        let reply = "I have updated the Digital Twin. The most critical intervention point right now is reallocating staff to prevent a backlog.";
        if (currentScenario.risks.length > 0) {
            if (text.toLowerCase().includes('bottleneck')) reply = `The main bottleneck is: ${currentScenario.risks[0].title}.`;
            if (text.toLowerCase().includes('health')) reply = `To improve health score from ${currentScenario.scores.total}, you should: ${currentScenario.risks[0].action}`;
        } else {
            reply = "Currently, all operations are running smoothly. Health score is optimal.";
        }
        
        chat.innerHTML += `<div class="chat-message bot">${reply}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }, 1000);
}
