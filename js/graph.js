// Knowledge Graph using vis.js

function renderKnowledgeGraph() {
    const container = document.getElementById('kg-network');
    if (!container) return;

    const data = {
        nodes: new vis.DataSet(graphData.nodes),
        edges: new vis.DataSet(graphData.edges)
    };

    const options = {
        nodes: {
            shape: 'dot',
            size: 25,
            font: {
                color: '#e2e8f0',
                size: 14,
                face: 'Inter'
            },
            borderWidth: 2,
            shadow: true
        },
        edges: {
            width: 2,
            color: { inherit: 'from' },
            font: {
                color: '#94a3b8',
                size: 12,
                align: 'middle'
            },
            arrows: 'to',
            smooth: { type: 'continuous' }
        },
        groups: {
            room: { color: { background: '#0f172a', border: '#3b82f6' } },
            booking: { color: { background: '#0f172a', border: '#10b981' } },
            guest: { color: { background: '#0f172a', border: '#f59e0b' } },
            employee: { color: { background: '#0f172a', border: '#8b5cf6' } },
            service: { color: { background: '#0f172a', border: '#ef4444' } },
            payment: { color: { background: '#0f172a', border: '#06b6d4' } },
            restaurant: { color: { background: '#0f172a', border: '#ec4899' } }
        },
        physics: {
            forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.01,
                springLength: 100,
                springConstant: 0.08
            },
            maxVelocity: 50,
            solver: 'forceAtlas2Based',
            timestep: 0.35,
            stabilization: { iterations: 150 }
        },
        interaction: {
            hover: true,
            tooltipDelay: 200
        }
    };

    const network = new vis.Network(container, data, options);

    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = data.nodes.get(nodeId);
            
            // Highlight connections
            network.selectNodes([nodeId]);
            
            // Show details
            const detailsHtml = `
                <h4>${node.label.toUpperCase()}</h4>
                <div style="margin-top: 15px;">
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 10px;">Connected Entities:</p>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        ${params.edges.map(edgeId => {
                            const edge = data.edges.get(edgeId);
                            const otherNodeId = edge.from === nodeId ? edge.to : edge.from;
                            const otherNode = data.nodes.get(otherNodeId);
                            const relation = edge.from === nodeId ? edge.label : `(incoming) ${edge.label}`;
                            return `<li style="padding: 8px; background: rgba(255,255,255,0.05); margin-bottom: 5px; border-radius: 4px; font-size: 0.9rem;">
                                ${relation} <strong style="color: var(--accent-cyan);">${otherNode.label}</strong>
                            </li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
            document.getElementById('kg-details').innerHTML = detailsHtml;
        } else {
            document.getElementById('kg-details').innerHTML = `<p class="text-muted">Click a node to explore connections.</p>`;
        }
    });
}

window.renderKnowledgeGraph = renderKnowledgeGraph;
