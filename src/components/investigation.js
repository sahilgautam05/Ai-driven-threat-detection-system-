import { stateManager } from '../state.js';
import { showToast, formatDate } from './utils.js';

export function initInvestigation() {
  const tabs = document.querySelectorAll('.sentinel-tabs .tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  
  // Header buttons
  const isolateBtn = document.getElementById('isolateAssetsBtn');
  const assignBtn = document.getElementById('assignIncidentBtn');
  const resolveBtn = document.getElementById('resolveIncidentBtn');
  
  // Note inputs
  const addNoteBtn = document.getElementById('addActivityBtn');
  const newNoteInput = document.getElementById('newActivityText');

  if (!tabs.length) return;

  // Tab switching binding
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetTab = tab.getAttribute('data-tab');
      const targetPanel = document.getElementById(`tab-${targetTab}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Action buttons
  if (isolateBtn) {
    isolateBtn.addEventListener('click', () => {
      const activeInc = getActiveIncident();
      if (!activeInc) return;

      // Mark affected assets as quarantined
      const assets = stateManager.state.assets;
      activeInc.assets.forEach(assetName => {
        const found = assets.find(a => a.name === assetName);
        if (found) {
          found.health = 'isolated';
          found.riskScore = 10; // isolated host risk drops
        }
      });
      stateManager.notify('assetsChanged', assets);
      
      // Update incident containment status in activity logs
      activeInc.activity.unshift({
        time: new Date().toISOString(),
        author: 'System (Automated containment)',
        text: `Triggered host network isolation block for assets: ${activeInc.assets.join(', ')}`
      });
      stateManager.notify('incidentsChanged', stateManager.state.incidents);
      
      showToast(`Quarantined and isolated ${activeInc.assets.length} hosts.`, 'success');
      stateManager.logAction('EDR Agent', `Triggered network containment for assets: ${activeInc.assets.join(', ')}`, 'Incident containment policy');
    });
  }

  if (assignBtn) {
    assignBtn.addEventListener('click', () => {
      const activeInc = getActiveIncident();
      if (!activeInc) return;

      const newAnalyst = prompt('Enter Analyst Name to reassign incident:', activeInc.assignedAnalyst);
      if (newAnalyst && newAnalyst.trim()) {
        activeInc.assignedAnalyst = newAnalyst.trim();
        activeInc.activity.unshift({
          time: new Date().toISOString(),
          author: 'System',
          text: `Incident reassigned to ${newAnalyst.trim()}`
        });
        stateManager.notify('incidentsChanged', stateManager.state.incidents);
        showToast(`Incident reassigned to ${newAnalyst.trim()}`, 'success');
        stateManager.logAction('Incident Manager', `Reassigned incident ${activeInc.id} to ${newAnalyst.trim()}`, activeInc.id);
      }
    });
  }

  if (resolveBtn) {
    resolveBtn.addEventListener('click', () => {
      const activeInc = getActiveIncident();
      if (!activeInc) return;

      activeInc.status = 'Resolved';
      activeInc.activity.unshift({
        time: new Date().toISOString(),
        author: stateManager.state.userRole,
        text: `Incident marked as RESOLVED. Remediation verify tasks completed.`
      });
      
      // Also update related assets health back to warning/healthy
      const assets = stateManager.state.assets;
      activeInc.assets.forEach(assetName => {
        const found = assets.find(a => a.name === assetName);
        if (found && found.health === 'critical') {
          found.health = 'healthy';
          found.riskScore = 15;
        }
      });
      stateManager.notify('assetsChanged', assets);
      stateManager.notify('incidentsChanged', stateManager.state.incidents);
      
      showToast(`Incident ${activeInc.id} successfully resolved and archived.`, 'success');
      stateManager.logAction('Incident Manager', `Resolved security incident: ${activeInc.id}`, activeInc.id);
    });
  }

  // Add Comment/Journal Note
  if (addNoteBtn && newNoteInput) {
    const handleAddNote = () => {
      const text = newNoteInput.value.trim();
      if (!text) return;

      const activeInc = getActiveIncident();
      if (!activeInc) return;

      activeInc.activity.unshift({
        time: new Date().toISOString(),
        author: `${stateManager.state.userRole} (Analyst)`,
        text: text
      });

      stateManager.notify('incidentsChanged', stateManager.state.incidents);
      newNoteInput.value = '';
      showToast('Comment appended to incident journal.', 'success');
      stateManager.logAction('Incident Manager', `Added note to incident ${activeInc.id}: "${text.substring(0, 30)}..."`, activeInc.id);
    };

    addNoteBtn.addEventListener('click', handleAddNote);
    newNoteInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddNote();
    });
  }

  // Subscribe to state updates
  stateManager.subscribe('incidentSelected', renderIncidentWorkspace);
  stateManager.subscribe('incidentsChanged', renderIncidentWorkspace);

  // Initial render
  renderIncidentWorkspace();

  function getActiveIncident() {
    const { incidents, selectedIncidentId } = stateManager.state;
    return incidents.find(i => i.id === selectedIncidentId);
  }

  function renderIncidentWorkspace() {
    const inc = getActiveIncident();
    if (!inc) return;

    // 1. Header bindings
    document.getElementById('incidentViewId').textContent = inc.id;
    document.getElementById('incidentViewTitle').textContent = inc.title;
    
    const severityBadge = document.getElementById('incidentViewSeverity');
    severityBadge.textContent = inc.severity;
    severityBadge.className = `badge ${inc.severity.toLowerCase()}`;

    const statusBadge = document.getElementById('incidentViewStatus');
    statusBadge.textContent = inc.status;
    statusBadge.className = `badge ${inc.status === 'Resolved' ? 'resolved' : 'active'}`;

    const riskIndicator = document.getElementById('incidentViewRisk');
    riskIndicator.textContent = `Risk Index: ${inc.riskScore}`;
    riskIndicator.className = `score-indicator ${inc.severity.toLowerCase()}`;

    // 2. Summary Tab bindings
    document.getElementById('inc-summary-what').textContent = inc.summary.whatHappened;
    document.getElementById('inc-summary-why').textContent = inc.summary.whyItMatters;
    document.getElementById('inc-summary-systems').textContent = inc.summary.affectedSystems;
    document.getElementById('inc-summary-evidence').textContent = inc.summary.detectionEvidence;
    
    // Sidebar Quick Attributes
    document.getElementById('inc-info-first').textContent = formatDate(inc.firstDetected);
    document.getElementById('inc-info-last').textContent = formatDate(inc.lastActivity);
    document.getElementById('inc-info-analyst').textContent = inc.assignedAnalyst;
    
    const statusText = document.getElementById('inc-info-status');
    const isIsolated = stateManager.state.assets.some(a => inc.assets.includes(a.name) && a.health === 'isolated');
    if (inc.status === 'Resolved') {
      statusText.textContent = 'Resolved';
      statusText.className = 'badge resolved';
    } else if (isIsolated) {
      statusText.textContent = 'Contained';
      statusText.className = 'badge low';
    } else {
      statusText.textContent = 'Active (Uncontained)';
      statusText.className = 'badge critical';
    }

    // Action recommendations
    const recsList = document.getElementById('inc-recommendations');
    recsList.innerHTML = '';
    inc.summary.recommendedNextSteps.forEach(rec => {
      const li = document.createElement('li');
      li.textContent = rec;
      recsList.appendChild(li);
    });

    // 3. Timeline Tab bindings
    const timelineContainer = document.getElementById('incidentTimelineContainer');
    timelineContainer.innerHTML = '';
    inc.timeline.forEach(event => {
      const item = document.createElement('div');
      item.className = 'timeline-event-item';
      
      let evIcon = '●';
      let dotClass = event.severity || 'Medium';

      item.innerHTML = `
        <div class="timeline-dot ${dotClass}">${evIcon}</div>
        <div class="timeline-card">
          <div class="timeline-time">${event.time} UTC</div>
          <div class="timeline-event-title">${event.event}</div>
          <div class="timeline-event-details">${event.details}</div>
          <div class="timeline-event-expand">
            <strong>Forensic Metadata Audit Log:</strong><br/>
            - Collector: EDR Daemon Engine v1.8<br/>
            - Host Payload Process: SHA256 matches actor telemetry<br/>
            - Signature Category: Mitre ATT&CK Tactics registered.
          </div>
        </div>
      `;

      item.querySelector('.timeline-card').addEventListener('click', function() {
        this.classList.toggle('expanded');
      });

      timelineContainer.appendChild(item);
    });

    // 4. Evidence Tab bindings
    const evidenceList = document.getElementById('incidentEvidenceList');
    evidenceList.innerHTML = '';
    inc.evidence.forEach(ev => {
      const row = document.createElement('div');
      row.className = 'evidence-row';
      row.innerHTML = `
        <div style="color:var(--text-secondary); font-size:0.8rem; font-weight:600;">${ev.type}</div>
        <div class="evidence-value">${ev.value}</div>
        <div><span class="badge ${ev.status === 'Malicious' ? 'critical' : ev.status === 'Suspicious' ? 'high' : 'low'}">${ev.status}</span></div>
        <div style="font-size:0.8rem; color:var(--text-secondary);">${ev.context} (${ev.label})</div>
      `;
      evidenceList.appendChild(row);
    });

    // 5. Entities Tab bindings
    const entitiesGrid = document.getElementById('incidentEntitiesGrid');
    entitiesGrid.innerHTML = '';
    inc.entities.forEach(ent => {
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.cursor = 'pointer';
      
      let entityClassBadge = 'info';
      if (ent.class === 'Server') entityClassBadge = 'critical';
      else if (ent.class === 'Identity') entityClassBadge = 'high';

      card.innerHTML = `
        <div class="card-header">
          <span style="font-weight:600;">${ent.name}</span>
          <span class="badge ${entityClassBadge}">${ent.class}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); margin-bottom:10px;">
          <strong>Role in incident:</strong> ${ent.role}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:0.75rem; color:var(--text-muted);">Risk Factor:</span>
          <span class="score-indicator ${ent.risk >= 80 ? 'critical' : 'medium'}">${ent.risk}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        // Find asset id to navigate
        const asset = stateManager.state.assets.find(a => a.name === ent.name);
        if (asset) {
          stateManager.setSelectedAsset(asset.id);
          stateManager.setView('assets');
        } else {
          showToast(`Asset details for ${ent.name} cannot be verified.`, 'info');
        }
      });

      entitiesGrid.appendChild(card);
    });

    // 6. AI Logic Tab bindings
    document.getElementById('inc-ai-summary').innerHTML = inc.aiAnalysis.summary.replace(/#INC-\d+/g, '<strong>$&</strong>');
    document.getElementById('inc-ai-uncertainty').textContent = inc.aiAnalysis.uncertainty;

    // 7. Activity Logs/Journal Tab bindings
    const activityLogContainer = document.getElementById('incidentActivityLogList');
    activityLogContainer.innerHTML = '';
    
    if (inc.activity.length === 0) {
      activityLogContainer.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; text-align:center;">No activity journal logs recorded.</div>';
      return;
    }

    inc.activity.forEach(act => {
      const logBox = document.createElement('div');
      logBox.style.padding = '12px 16px';
      logBox.style.background = 'rgba(255, 255, 255, 0.01)';
      logBox.style.border = '1px solid rgba(255, 255, 255, 0.04)';
      logBox.style.borderRadius = '8px';
      
      let authorTag = act.author;
      let authorColor = 'var(--text-primary)';
      if (authorTag.includes('System')) {
        authorColor = 'var(--accent-cyan)';
      } else if (authorTag.includes('Analyst') || authorTag.includes('Sarah')) {
        authorColor = 'var(--accent-purple-glowing)';
      }

      const timestamp = act.time.includes('T') ? formatDate(act.time) : act.time;

      logBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px; font-size:0.75rem;">
          <span style="font-weight:600; color:${authorColor};">${authorTag}</span>
          <span style="color:var(--text-muted);">${timestamp}</span>
        </div>
        <div style="font-size:0.875rem; line-height:1.4;">${act.text}</div>
      `;
      activityLogContainer.appendChild(logBox);
    });
  }
}
