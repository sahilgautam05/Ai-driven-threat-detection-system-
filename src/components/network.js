import { stateManager } from '../state.js';

export function initNetworkMap() {
  const canvas = document.getElementById('networkCanvas');
  const inspectorBody = document.getElementById('networkNodeInspectorBody');

  if (!canvas || !inspectorBody) return;

  const ctx = canvas.getContext('2d');
  let animationId = null;

  // Define Nodes in the system
  let nodes = [
    { id: 'n1', label: 'alice.smith@sentinel.ai', type: 'User Identity', x: 100, y: 150, radius: 24, status: 'warning', risk: 48, details: 'Session active. Spear phishing link clicked.' },
    { id: 'n2', label: 'admin.svc@sentinel.ai', type: 'User Identity', x: 100, y: 350, radius: 24, status: 'critical', risk: 92, details: 'Service account credentials compromised via Kerberos ticket injection.' },
    { id: 'n3', label: 'wkst-dev-alice', type: 'Workstation', x: 260, y: 150, radius: 20, status: 'warning', risk: 42, details: 'Developer client host. Active Parisian geolocation mismatch.' },
    { id: 'n4', label: 'srv-corp-ad-01', type: 'Active Directory DC', x: 420, y: 250, radius: 26, status: 'warning', risk: 65, details: 'Domain controller. Ingesting multiple failed authentication triggers.' },
    { id: 'n5', label: 'srv-prod-db-01', type: 'Database Server', x: 580, y: 250, radius: 26, status: 'critical', risk: 89, details: 'PostgreSQL database. Active administrative reverse bash shell active.' },
    { id: 'n6', label: 'aws-s3-customer-records', type: 'Cloud Bucket', x: 740, y: 200, radius: 22, status: 'warning', risk: 54, details: 'Production backup storage. Triggering large outbound egress data stream.' },
    { id: 'n7', label: 'External IP (203.0.113.110)', type: 'External Connection', x: 900, y: 300, radius: 18, status: 'critical', risk: 85, details: 'Hosting provider block in Netherlands. Data exfiltration sink.' },
    { id: 'n8', label: 'Tor Net Exit (198.51.100.72)', type: 'External Connection', x: 200, y: 40, radius: 18, status: 'critical', risk: 99, details: 'French proxy exit node routing compromised SSH admin portal session.' }
  ];

  // Define Links (connections)
  const links = [
    { source: 'n1', target: 'n3', status: 'warning', speed: 1.5 },
    { source: 'n8', target: 'n3', status: 'critical', speed: 2 },
    { source: 'n3', target: 'n4', status: 'warning', speed: 1 },
    { source: 'n2', target: 'n4', status: 'critical', speed: 2.5 },
    { source: 'n4', target: 'n5', status: 'critical', speed: 3 },
    { source: 'n5', target: 'n6', status: 'critical', speed: 2 },
    { source: 'n6', target: 'n7', status: 'critical', speed: 4 }
  ];

  let selectedNode = null;
  let hoveredNode = null;
  let draggedNode = null;
  let offset = { x: 0, y: 0 };
  let particles = [];

  // Initialize animated traffic particles
  links.forEach(link => {
    for (let i = 0; i < 3; i++) {
      particles.push({
        link,
        progress: Math.random(),
        size: 2 + Math.random() * 2
      });
    }
  });

  // Resize handler
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Animation Loop
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw links
    links.forEach(link => {
      const sNode = nodes.find(n => n.id === link.source);
      const tNode = nodes.find(n => n.id === link.target);
      if (!sNode || !tNode) return;

      ctx.beginPath();
      ctx.moveTo(sNode.x, sNode.y);
      ctx.lineTo(tNode.x, tNode.y);
      
      if (link.status === 'critical') {
        ctx.strokeStyle = 'rgba(255, 59, 48, 0.4)';
        ctx.lineWidth = 2.5;
        // Pulse glow path
        ctx.shadowColor = 'rgba(255, 59, 48, 0.3)';
        ctx.shadowBlur = 8;
      } else if (link.status === 'warning') {
        ctx.strokeStyle = 'rgba(255, 149, 0, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow
    });

    // Draw traffic particles
    particles.forEach(p => {
      const sNode = nodes.find(n => n.id === p.link.source);
      const tNode = nodes.find(n => n.id === p.link.target);
      if (!sNode || !tNode) return;

      // Update particle progress
      p.progress += 0.005 * p.link.speed;
      if (p.progress > 1) p.progress = 0;

      // Calculate position
      const x = sNode.x + (tNode.x - sNode.x) * p.progress;
      const y = sNode.y + (tNode.y - sNode.y) * p.progress;

      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, 2 * Math.PI);
      ctx.fillStyle = p.link.status === 'critical' ? 'var(--status-critical)' : 'var(--accent-cyan)';
      ctx.fill();
    });

    // Draw nodes
    nodes.forEach(node => {
      // Glow Ring for Compromised/Critical Nodes
      if (node.status === 'critical') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 6, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(255, 59, 48, 0.08)';
        ctx.strokeStyle = 'rgba(255, 59, 48, 0.3)';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      }

      // Main circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'var(--bg-main)';
      ctx.fill();

      // Border Color code
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      
      let strokeColor = 'var(--accent-cyan)';
      if (node.status === 'critical') strokeColor = 'var(--status-critical)';
      else if (node.status === 'warning') strokeColor = 'var(--status-high)';
      else if (node.status === 'isolated') strokeColor = 'var(--accent-purple)';

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = selectedNode === node ? 3 : hoveredNode === node ? 2 : 1.5;
      ctx.stroke();

      // Inner icon or small text character
      ctx.fillStyle = strokeColor;
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let symbol = '🖥️';
      if (node.type.includes('User')) symbol = '👤';
      else if (node.type.includes('Cloud')) symbol = '☁️';
      else if (node.type.includes('External')) symbol = '🌐';
      ctx.fillText(symbol, node.x, node.y);

      // Label text
      ctx.fillStyle = hoveredNode === node || selectedNode === node ? 'white' : 'var(--text-secondary)';
      ctx.font = '500 11px var(--font-sans)';
      ctx.fillText(node.label, node.x, node.y + node.radius + 15);
    });

    animationId = requestAnimationFrame(tick);
  }

  // Mouse Interaction Handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedNode) {
      draggedNode.x = x - offset.x;
      draggedNode.y = y - offset.y;
      return;
    }

    // Hit test nodes
    let found = null;
    nodes.forEach(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist < node.radius) found = node;
    });

    hoveredNode = found;
    canvas.style.cursor = found ? 'pointer' : 'default';
  });

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check click on node
    nodes.forEach(node => {
      const dist = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (dist < node.radius) {
        draggedNode = node;
        selectedNode = node;
        offset.x = x - node.x;
        offset.y = y - node.y;
        updateInspector(node);
      }
    });
  });

  window.addEventListener('mouseup', () => {
    draggedNode = null;
  });

  function updateInspector(node) {
    let statusClass = 'low';
    if (node.status === 'critical') statusClass = 'critical';
    else if (node.status === 'warning') statusClass = 'high';
    else if (node.status === 'isolated') statusClass = 'active';

    inspectorBody.innerHTML = `
      <div style="font-weight:600; font-size:1.05rem; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:8px;">${node.label}</div>
      <div style="display:flex; justify-content:space-between; margin-top:8px;">
        <span style="color:var(--text-secondary);">Type:</span>
        <span>${node.type}</span>
      </div>
      <div style="display:flex; justify-content:space-between;">
        <span style="color:var(--text-secondary);">Status:</span>
        <span class="badge ${statusClass}">${node.status}</span>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="color:var(--text-secondary);">Risk Factor:</span>
        <span class="score-indicator ${node.risk >= 80 ? 'critical' : 'medium'}">${node.risk}/100</span>
      </div>
      <div style="margin-top:12px; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; line-height:1.4; color:var(--text-primary);">
        <strong>Attribution details:</strong><br/>
        ${node.details}
      </div>
      <button class="btn-primary" style="margin-top:10px; width:100%; justify-content:center;" id="inspectorIsolateBtn">Isolate Connection Node</button>
    `;

    // Hook isolate button in inspector
    document.getElementById('inspectorIsolateBtn').addEventListener('click', () => {
      node.status = 'isolated';
      node.risk = 10;
      updateInspector(node);
      
      // Sync with data assets if matching name
      const assets = stateManager.state.assets;
      const foundAsset = assets.find(a => a.name === node.label);
      if (foundAsset) {
        foundAsset.health = 'isolated';
        foundAsset.riskScore = 10;
        stateManager.notify('assetsChanged', assets);
      }
      stateManager.logAction('Network Graph', `Isolated network connection topology node: ${node.label}`, 'Network Console');
    });
  }

  // Start Animation
  tick();

  // Cancel animation frame on deactivate view
  stateManager.subscribe('viewChanged', (view) => {
    if (view !== 'network' && animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else if (view === 'network' && !animationId) {
      tick();
    }
  });
}
