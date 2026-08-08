import { stateManager } from './src/state.js';
import { initSidebar } from './src/components/sidebar.js';
import { initDashboard } from './src/components/dashboard.js';
import { initDetections } from './src/components/detections.js';
import { initInvestigation } from './src/components/investigation.js';
import { initCopilot } from './src/components/copilot.js';
import { initAssets } from './src/components/assets.js';
import { initNetworkMap } from './src/components/network.js';
import { initThreatIntel } from './src/components/intel.js';
import { initRulesEditor } from './src/components/rules.js';
import { initReports } from './src/components/reports.js';
import { initNotifications } from './src/components/notifications.js';
import { initCommandPalette } from './src/components/commands.js';
import { showToast, formatDate } from './src/components/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('Sentinel AI Security Operations Platform launching...');

  // Initialize Core Layout & Global Panels
  initSidebar();
  initCommandPalette();
  initNotifications();

  // Initialize View workspaces
  initDashboard();
  initDetections();
  initInvestigation();
  initCopilot();
  initAssets();
  initNetworkMap();
  initThreatIntel();
  initRulesEditor();
  initReports();

  // Bind Topbar Role Swapping button
  const roleBtn = document.getElementById('roleBadgeBtn');
  const roleLabel = document.getElementById('roleBadgeLabel');
  const roleDot = document.getElementById('roleBadgeDot');
  
  if (roleBtn && roleLabel && roleDot) {
    const roles = ['Analyst', 'Admin', 'Auditor'];
    let currentRoleIdx = 0;

    roleBtn.addEventListener('click', () => {
      currentRoleIdx = (currentRoleIdx + 1) % roles.length;
      const nextRole = roles[currentRoleIdx];
      stateManager.setUserRole(nextRole);
      
      showToast(`Switched user context to: ${nextRole} Privileges`, 'info');
    });

    // Synchronize state switches (e.g. from Command palette or Settings page)
    stateManager.subscribe('roleChanged', (role) => {
      roleLabel.textContent = role;
      roleDot.className = 'role-dot';
      currentRoleIdx = roles.indexOf(role);

      if (role === 'Admin') {
        roleDot.classList.add('admin');
      } else if (role === 'Auditor') {
        roleDot.classList.add('auditor');
      }
      
      // Update configuration forms if present
      const settingsSelect = document.getElementById('settingsRoleSelector');
      if (settingsSelect && settingsSelect.value !== role) {
        settingsSelect.value = role;
      }
    });
  }

  // Bind Settings Workspace Panel Forms
  const settingsSelect = document.getElementById('settingsRoleSelector');
  const settingsOrg = document.getElementById('settingsOrgSelector');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  
  if (settingsSelect && settingsOrg && saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const selectedRole = settingsSelect.value;
      const selectedOrg = settingsOrg.value;
      
      stateManager.setUserRole(selectedRole);
      stateManager.setActiveOrg(selectedOrg);
      
      showToast('SOC system configuration profile updated.', 'success');
    });

    stateManager.subscribe('roleChanged', (role) => {
      settingsSelect.value = role;
    });

    stateManager.subscribe('orgChanged', (org) => {
      settingsOrg.value = org;
    });
  }

  // Initialize Auditor Security Logs view
  initAuditLogTable();

  // Initial welcome notification Toast
  setTimeout(() => {
    showToast('Sentinel AI core initialized. Threat monitoring active.', 'success');
  }, 1000);
});

function initAuditLogTable() {
  const auditBody = document.getElementById('auditLogsTableBody');
  const auditSearch = document.getElementById('auditLogSearch');

  if (!auditBody) return;

  renderAuditLogs();

  // Subscribe to audit updates
  stateManager.subscribe('auditLogsChanged', renderAuditLogs);
  stateManager.subscribe('roleChanged', renderAuditLogs);

  // Search filter typing
  if (auditSearch) {
    auditSearch.addEventListener('input', renderAuditLogs);
  }

  function getFilteredLogs() {
    const { auditLogs } = stateManager.state;
    const query = auditSearch ? auditSearch.value.trim().toLowerCase() : "";

    return auditLogs.filter(log => {
      if (!query) return true;
      return (
        log.actor.toLowerCase().includes(query) ||
        log.role.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query)
      );
    });
  }

  function renderAuditLogs() {
    const logs = getFilteredLogs();
    auditBody.innerHTML = '';

    if (logs.length === 0) {
      auditBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px 0;">
            No records matched security auditor criteria.
          </td>
        </tr>
      `;
      return;
    }

    logs.forEach(log => {
      const tr = document.createElement('tr');
      
      let roleBadgeColor = 'badge info';
      if (log.role === 'Admin') roleBadgeColor = 'badge critical';
      else if (log.role === 'Auditor') roleBadgeColor = 'badge high';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-secondary);">${formatDate(log.timestamp)}</td>
        <td style="font-weight: 500; color: var(--text-primary);">${log.actor}</td>
        <td><span class="${roleBadgeColor}" style="font-size:0.7rem; padding: 2px 6px;">${log.role}</span></td>
        <td style="white-space: normal; font-size: 0.875rem;">${log.action}</td>
        <td style="font-family: var(--font-mono); font-size: 0.825rem; color: var(--accent-cyan);">${log.resource}</td>
      `;

      auditBody.appendChild(tr);
    });
  }
}
