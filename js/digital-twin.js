// Digital Twin logic

const twinMapContainer = document.getElementById('hotel-map');
const twinInspector = document.getElementById('twin-inspector');

function renderDigitalTwin(scenario) {
    if(!scenario) return;

    let qRisk = scenario.calc.capacityDeficitPerHour > 0 ? 'red' : 'green';
    let sRisk = scenario.calc.staffGap > 0 ? 'amber' : 'green';
    let utilRisk = scenario.calc.capacityUtil > 90 ? 'amber' : 'green';
    
    // If it's a severe deficit, make util red
    if (scenario.calc.capacityDeficitPerHour > 50) utilRisk = 'red';

    let svgContent = `
    <svg class="twin-svg" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#1e293b" />
                <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
            <filter id="glowGreen"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowRed"><feGaussianBlur stdDeviation="4" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="glowAmber"><feGaussianBlur stdDeviation="3" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <!-- Floor 3 -->
        <rect x="50" y="50" width="700" height="100" fill="url(#floorGrad)" rx="5" stroke="#334155" stroke-width="2"/>
        <text x="60" y="100" fill="#64748b" font-size="14" transform="rotate(-90 60 100)">F3</text>
        ${renderRooms(3, 100, 60, [
            {id: '301', status: 'green'}, {id: '302', status: utilRisk}, {id: '303', status: sRisk},
            {id: '304', status: sRisk === 'amber' ? 'red' : 'green'}, {id: '305', status: 'green'}, {id: '306', status: 'green'}
        ])}

        <!-- Floor 2 -->
        <rect x="50" y="180" width="700" height="100" fill="url(#floorGrad)" rx="5" stroke="#334155" stroke-width="2"/>
        <text x="60" y="230" fill="#64748b" font-size="14" transform="rotate(-90 60 230)">F2</text>
        ${renderRooms(2, 100, 190, [
            {id: '201', status: utilRisk}, {id: '202', status: utilRisk}, {id: '203', status: 'green'},
            {id: '204', status: 'green'}, {id: '205', status: 'green'}, {id: '206', status: 'green'}
        ])}

        <!-- Floor 1 (Lobby / Amenities) -->
        <rect x="50" y="310" width="700" height="150" fill="url(#floorGrad)" rx="5" stroke="#334155" stroke-width="2"/>
        <text x="60" y="385" fill="#64748b" font-size="14" transform="rotate(-90 60 385)">MAIN</text>
        
        <!-- Processing / Reception -->
        <rect class="twin-room" id="area-reception" x="100" y="330" width="200" height="110" 
            fill="${qRisk === 'red' ? 'rgba(239,68,68,0.2)' : 'rgba(6, 182, 212, 0.2)'}" 
            stroke="${qRisk === 'red' ? '#ef4444' : '#06b6d4'}" 
            stroke-width="2" rx="4" onclick="inspectEntity('reception', '${qRisk}')"/>
        <text x="140" y="385" fill="#e2e8f0" font-size="16">Service Counters</text>
        
        ${qRisk === 'red' ? `
            <circle cx="130" cy="350" r="5" fill="#ef4444" filter="url(#glowRed)"/>
            <circle cx="145" cy="350" r="5" fill="#ef4444" filter="url(#glowRed)"/>
            <circle cx="160" cy="350" r="5" fill="#ef4444" filter="url(#glowRed)"/>
            <circle cx="130" cy="365" r="5" fill="#ef4444" filter="url(#glowRed)"/>
            <circle cx="145" cy="365" r="5" fill="#ef4444" filter="url(#glowRed)"/>
            <text x="125" y="415" fill="#ef4444" font-size="10">CONGESTION DETECTED</text>
        ` : `
            <circle cx="145" cy="350" r="5" fill="#10b981" filter="url(#glowGreen)"/>
        `}

        <!-- Service Area -->
        <rect class="twin-room" id="area-service" x="350" y="330" width="150" height="110" 
            fill="${sRisk === 'amber' ? 'rgba(245,158,11,0.2)' : 'rgba(16, 185, 129, 0.2)'}" 
            stroke="${sRisk === 'amber' ? '#f59e0b' : '#10b981'}" 
            stroke-width="2" rx="4" onclick="inspectEntity('service', '${sRisk}')"/>
        <text x="370" y="385" fill="#e2e8f0" font-size="14">Workforce Pool</text>

        <!-- Inventory Area -->
        <rect class="twin-room" id="area-inventory" x="550" y="330" width="150" height="110" 
            fill="${scenario.calc.resourceGap > 0 ? 'rgba(239,68,68,0.2)' : 'rgba(16, 185, 129, 0.2)'}" 
            stroke="${scenario.calc.resourceGap > 0 ? '#ef4444' : '#10b981'}" 
            stroke-width="2" rx="4" onclick="inspectEntity('inventory', '${scenario.calc.resourceGap}')"/>
        <text x="580" y="385" fill="#e2e8f0" font-size="14">Resources</text>
        
        <!-- Animated Staff dots -->
        ${sRisk !== 'amber' ? `
            <circle id="staff-1" cx="400" cy="350" r="6" fill="#3b82f6" filter="url(#glowGreen)">
                <animate attributeName="cx" values="400; 150; 400" dur="8s" repeatCount="indefinite" />
            </circle>
            <circle id="staff-2" cx="420" cy="380" r="6" fill="#3b82f6" filter="url(#glowGreen)">
                <animate attributeName="cy" values="380; 250; 120; 380" dur="12s" repeatCount="indefinite" />
            </circle>
        ` : `
            <circle id="staff-1" cx="380" cy="360" r="6" fill="#f59e0b" filter="url(#glowAmber)">
                <animate attributeName="cx" values="380; 390; 380" dur="2s" repeatCount="indefinite" />
            </circle>
        `}
    </svg>
    `;
    
    twinMapContainer.innerHTML = svgContent;
    twinInspector.innerHTML = `
        <h3>Digital Twin Active</h3>
        <p class="text-muted">Currently viewing ${document.getElementById('btn-twin-before').classList.contains('active') ? 'Baseline Plan' : 'AI Optimized Plan'}.</p>
        <p style="margin-top:20px">Click highlighted zones to see detailed calculation limits.</p>
    `;
}

function renderRooms(floor, startX, y, rooms) {
    let html = '';
    const roomWidth = 90;
    const roomHeight = 80;
    const spacing = 15;
    
    rooms.forEach((room, index) => {
        const x = startX + (index * (roomWidth + spacing));
        let strokeColor = '#334155';
        let fillColor = 'rgba(255,255,255,0.05)';
        let filter = '';
        
        if(room.status === 'green') { strokeColor = '#10b981'; fillColor = 'rgba(16,185,129,0.1)'; }
        if(room.status === 'amber') { strokeColor = '#f59e0b'; fillColor = 'rgba(245,158,11,0.1)'; filter = 'filter="url(#glowAmber)"'; }
        if(room.status === 'red') { strokeColor = '#ef4444'; fillColor = 'rgba(239,68,68,0.2)'; filter = 'filter="url(#glowRed)"'; }
        
        html += `
            <g class="twin-room" onclick="inspectEntity('room', '${room.status}')">
                <rect x="${x}" y="${y}" width="${roomWidth}" height="${roomHeight}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="2" rx="4" ${filter} />
                <text x="${x + 10}" y="${y + 25}" fill="#e2e8f0" font-size="16" font-weight="bold">${room.id}</text>
                <text x="${x + 10}" y="${y + 45}" fill="#94a3b8" font-size="10">Status: ${room.status.toUpperCase()}</text>
                ${room.status === 'red' ? `<circle cx="${x + roomWidth - 15}" cy="${y + 15}" r="5" fill="#ef4444"/>` : ''}
            </g>
        `;
    });
    return html;
}

function inspectEntity(type, status) {
    let content = '';
    
    if(type === 'room') {
        const isRed = status === 'red';
        content = `
            <h3>Zone Capacity</h3>
            <div class="card" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-glass); margin-top: 15px; padding: 15px;">
                <p><strong>Status:</strong> ${isRed ? '<span class="text-red">Overloaded</span>' : 'Optimal'}</p>
                <p><strong>Utilization:</strong> ${isRed ? '108%' : '85%'}</p>
                ${isRed ? '<div style="margin-top: 10px; padding: 8px; background: rgba(239,68,68,0.2); border-left: 3px solid #ef4444;">AI Warning: Capacity limits exceeded.</div>' : ''}
            </div>
        `;
    } else if (type === 'reception') {
        const isRed = status === 'red';
        content = `
            <h3>Service Counters</h3>
            <div class="card" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-glass); margin-top: 15px; padding: 15px;">
                <p><strong>Queue Risk:</strong> ${isRed ? '<span class="text-red">HIGH</span>' : '<span class="text-green">LOW</span>'}</p>
                <p><strong>Flow Status:</strong> ${isRed ? 'Bottleneck forming at Peak' : 'Flow is clear'}</p>
                ${isRed ? '<button class="btn-primary w-full mt-4" onclick="switchView(`operational-plan`)">View AI Solution</button>' : ''}
            </div>
        `;
    } else if (type === 'service') {
         const isAmber = status === 'amber';
         content = `
            <h3>Workforce Pool</h3>
            <div class="card" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-glass); margin-top: 15px; padding: 15px;">
                <p><strong>Readiness:</strong> ${isAmber ? '<span class="text-amber">Shortage Predicted</span>' : '<span class="text-green">Optimal</span>'}</p>
                ${isAmber ? '<button class="btn-primary w-full mt-4" onclick="switchView(`operational-plan`)">View Allocation Plan</button>' : ''}
            </div>
        `;
    } else if (type === 'inventory') {
         const gap = parseInt(status);
         content = `
            <h3>Resource Depot</h3>
            <div class="card" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-glass); margin-top: 15px; padding: 15px;">
                <p><strong>Gap:</strong> ${gap > 0 ? `<span class="text-red">-${gap} units short</span>` : '<span class="text-green">Adequate</span>'}</p>
            </div>
        `;
    }
    
    twinInspector.innerHTML = content;
}

window.renderDigitalTwin = renderDigitalTwin;
