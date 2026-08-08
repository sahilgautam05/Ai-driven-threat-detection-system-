import { stateManager } from '../state.js';
import { showToast } from './utils.js';

export function initCommandPalette() {
  const modal = document.getElementById('commandPaletteModal');
  const input = document.getElementById('commandPaletteInput');
  const resultsContainer = document.getElementById('commandPaletteResults');
  const globalSearchBtn = document.getElementById('globalSearchBtn');

  if (!modal || !input || !resultsContainer) return;

  let selectedIdx = 0;
  let activeOptions = [];

  const commandList = [
    { label: 'Go to Overview Dashboard', category: 'Navigation', action: () => stateManager.setView('overview') },
    { label: 'Go to Threat Detection workbench', category: 'Navigation', action: () => stateManager.setView('detections') },
    { label: 'Go to Incidents investigation workspace', category: 'Navigation', action: () => stateManager.setView('incidents') },
    { label: 'Go to Assets Intelligence', category: 'Navigation', action: () => stateManager.setView('assets') },
    { label: 'Go to Network Topology Map', category: 'Navigation', action: () => stateManager.setView('network') },
    { label: 'Go to Detection Rules list', category: 'Navigation', action: () => stateManager.setView('rules') },
    { label: 'Go to Threat Intelligence database', category: 'Navigation', action: () => stateManager.setView('intel') },
    { label: 'Go to Reports generator', category: 'Navigation', action: () => stateManager.setView('reports') },
    { label: 'Go to Audit Logs tracking', category: 'Navigation', action: () => stateManager.setView('audit') },
    { label: 'Go to settings workspace', category: 'Navigation', action: () => stateManager.setView('settings') },
    
    { label: 'Action: Isolate Compromised Hosts (EDR)', category: 'System Action', action: () => {
      const activeInc = stateManager.state.incidents[0];
      const assets = stateManager.state.assets;
      activeInc.assets.forEach(aName => {
        const found = assets.find(a => a.name === aName);
        if (found) found.health = 'isolated';
      });
      stateManager.notify('assetsChanged', assets);
      showToast('Triggered bulk EDR isolation on active endpoints.', 'success');
      stateManager.logAction('EDR Agent', `Triggered bulk network containment`, 'Command Palette');
    }},
    { label: 'Action: Switch role to SOC Administrator', category: 'System Action', action: () => stateManager.setUserRole('Admin') },
    { label: 'Action: Switch role to Threat Analyst', category: 'System Action', action: () => stateManager.setUserRole('Analyst') },
    { label: 'Action: Reset Copilot Conversation History', category: 'System Action', action: () => stateManager.clearCopilotMessages() }
  ];

  // Toggle Command Palette
  const togglePalette = () => {
    const isOpen = modal.classList.toggle('open');
    if (isOpen) {
      input.value = "";
      selectedIdx = 0;
      renderOptions();
      setTimeout(() => input.focus(), 50);
    }
  };

  // Click Trigger
  if (globalSearchBtn) {
    globalSearchBtn.addEventListener('click', togglePalette);
  }

  // Keyboard Shortcuts (Ctrl+K, Esc)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette();
    }
    if (e.key === 'Escape') {
      modal.classList.remove('open');
      const drawer = document.getElementById('detailsDrawer');
      if (drawer) drawer.classList.remove('open');
      const rModal = document.getElementById('ruleModal');
      if (rModal) rModal.classList.remove('open');
    }
  });

  // Input events
  input.addEventListener('input', () => {
    selectedIdx = 0;
    renderOptions();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % activeOptions.length;
      highlightSelected();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + activeOptions.length) % activeOptions.length;
      highlightSelected();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeOptions[selectedIdx]) {
        activeOptions[selectedIdx].action();
        modal.classList.remove('open');
      }
    }
  });

  // Close overlay on background click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });

  function renderOptions() {
    const query = input.value.trim().toLowerCase();
    resultsContainer.innerHTML = '';
    activeOptions = [];

    // Filter static commands
    let matchedCommands = commandList.filter(c => 
      c.label.toLowerCase().includes(query) || 
      c.category.toLowerCase().includes(query)
    );

    // Filter dynamic incidents/alerts telemetry
    let matchedTelemetry = [];
    if (query.length > 1) {
      const { incidents, detections } = stateManager.state;
      incidents.forEach(inc => {
        if (inc.id.toLowerCase().includes(query) || inc.title.toLowerCase().includes(query)) {
          matchedTelemetry.push({
            label: `Inspect Incident: ${inc.id} - ${inc.title}`,
            category: 'Security Telemetry',
            action: () => {
              stateManager.setSelectedIncident(inc.id);
              stateManager.setView('incidents');
            }
          });
        }
      });
      detections.forEach(det => {
        if (det.id.toLowerCase().includes(query) || det.category.toLowerCase().includes(query) || det.asset.toLowerCase().includes(query)) {
          matchedTelemetry.push({
            label: `Open Alert Log: ${det.id} - ${det.category} (${det.asset})`,
            category: 'Security Telemetry',
            action: () => {
              stateManager.setView('detections');
              // Highlight drawer trigger simulation
              const row = document.querySelector(`tr[data-id="${det.id}"]`);
              if (row) row.click();
            }
          });
        }
      });
    }

    activeOptions = [...matchedCommands, ...matchedTelemetry].slice(0, 8);

    if (activeOptions.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
          No matching operational command or alert indexes found.
        </div>
      `;
      return;
    }

    activeOptions.forEach((opt, idx) => {
      const div = document.createElement('div');
      div.className = `command-option ${idx === selectedIdx ? 'selected' : ''}`;
      div.innerHTML = `
        <span>${opt.label}</span>
        <span style="font-size:0.7rem; background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px; text-transform:uppercase; color:var(--text-secondary);">${opt.category}</span>
      `;
      
      div.addEventListener('click', () => {
        opt.action();
        modal.classList.remove('open');
      });

      resultsContainer.appendChild(div);
    });
  }

  function highlightSelected() {
    const options = resultsContainer.querySelectorAll('.command-option');
    options.forEach((el, idx) => {
      if (idx === selectedIdx) {
        el.classList.add('selected');
        el.scrollIntoView({ block: 'nearest' });
      } else {
        el.classList.remove('selected');
      }
    });
  }
}
