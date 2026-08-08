import { stateManager } from '../state.js';
import { exportToCSV, showToast, formatDate } from './utils.js';

export function initDetections() {
  const tableBody = document.getElementById('detectionsTableBody');
  const severityFilters = document.getElementById('detectionSeverityFilters');
  const searchInput = document.getElementById('detectionSearch');
  const exportBtn = document.getElementById('exportDetectionsBtn');
  const selectAllCheckbox = document.getElementById('selectAllDetections');
  
  // Drawer Elements
  const drawer = document.getElementById('detailsDrawer');
  const closeDrawerBtn = document.getElementById('closeDrawerBtn');
  const drawerId = document.getElementById('drawerId');
  const drawerTitle = document.getElementById('drawerTitle');
  const drawerSeverity = document.getElementById('drawerSeverity');
  const drawerRiskScore = document.getElementById('drawerRiskScore');
  const drawerConfidence = document.getElementById('drawerConfidence');
  const drawerReason = document.getElementById('drawerReason');
  const drawerObserved = document.getElementById('drawerObserved');
  const drawerInference = document.getElementById('drawerInference');
  const drawerNextSteps = document.getElementById('drawerNextSteps');
  const drawerInvestigateBtn = document.getElementById('drawerInvestigateBtn');
  const drawerResolveBtn = document.getElementById('drawerResolveBtn');

  if (!tableBody || !severityFilters || !searchInput) return;

  // Initial draw
  renderDetectionsTable();

  // Subscribe to changes
  stateManager.subscribe('detectionsChanged', renderDetectionsTable);
  stateManager.subscribe('filtersChanged', () => {
    renderDetectionsTable();
    syncFiltersUI();
  });

  // Severity pill filter event listeners
  severityFilters.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;
    
    // Remove active from others
    severityFilters.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const severity = pill.getAttribute('data-severity');
    stateManager.setFilter('severity', severity);
  });

  // Search input typing
  searchInput.addEventListener('input', (e) => {
    stateManager.setFilter('searchQuery', e.target.value.trim());
  });

  // Bulk select checkbox
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      const checkboxes = tableBody.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => cb.checked = isChecked);
    });
  }

  // Export to CSV
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const filtered = getFilteredDetections();
      const headers = ['ID', 'Timestamp', 'Severity', 'Category', 'Asset', 'User', 'Risk Score', 'Confidence %', 'Status'];
      const dataRows = filtered.map(d => [
        d.id,
        d.timestamp,
        d.severity,
        d.category,
        d.asset,
        d.user,
        d.riskScore,
        d.confidence,
        d.status
      ]);
      exportToCSV(headers, dataRows, `Sentinel_Detections_${new Date().toISOString().split('T')[0]}.csv`);
    });
  }

  // Drawer Close Button
  if (closeDrawerBtn && drawer) {
    closeDrawerBtn.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  }

  // Drawer Investigate Button
  if (drawerInvestigateBtn) {
    drawerInvestigateBtn.addEventListener('click', () => {
      const detId = drawerId.textContent;
      const det = stateManager.state.detections.find(d => d.id === detId);
      if (det && det.incidentId) {
        stateManager.setSelectedIncident(det.incidentId);
        stateManager.setView('incidents');
        drawer.classList.remove('open');
      } else {
        showToast(`No parent incident found for telemetry ${detId}. Creating dynamic sandbox.`, 'info');
      }
    });
  }

  // Drawer Resolve Alert Button
  if (drawerResolveBtn) {
    drawerResolveBtn.addEventListener('click', () => {
      const detId = drawerId.textContent;
      const detections = stateManager.state.detections;
      const det = detections.find(d => d.id === detId);
      if (det) {
        det.status = 'Resolved';
        stateManager.notify('detectionsChanged', detections);
        showToast(`Security alert ${detId} marked as Resolved.`, 'success');
        stateManager.logAction('Detections Workbench', `Resolved threat detection alert: ${detId}`, det.asset);
        drawer.classList.remove('open');
      }
    });
  }

  function getFilteredDetections() {
    const { detections, filters } = stateManager.state;
    return detections.filter(d => {
      // 1. Severity check
      if (filters.severity !== 'All' && d.severity !== filters.severity) return false;
      
      // 2. Category check
      if (filters.category !== 'All' && d.category !== filters.category) return false;
      
      // 3. Search query check
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesQuery = 
          d.id.toLowerCase().includes(query) ||
          d.category.toLowerCase().includes(query) ||
          d.asset.toLowerCase().includes(query) ||
          d.user.toLowerCase().includes(query) ||
          d.reason.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }

  function renderDetectionsTable() {
    const filtered = getFilteredDetections();
    tableBody.innerHTML = '';

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1" style="stroke: var(--text-muted); margin-bottom: 12px; display:block; margin-left:auto; margin-right:auto;">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            </svg>
            No active threat alerts match the filtering criteria.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(det => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-id', det.id);
      
      let badgeClass = 'low';
      if (det.severity === 'Critical') badgeClass = 'critical';
      else if (det.severity === 'High') badgeClass = 'high';
      else if (det.severity === 'Medium') badgeClass = 'medium';

      let statusBadgeClass = 'active';
      if (det.status === 'Resolved') statusBadgeClass = 'resolved';

      tr.innerHTML = `
        <td style="width: 40px;" class="table-checkbox"><input type="checkbox" data-select-id="${det.id}"></td>
        <td style="font-family: var(--font-mono); font-weight:600; color: var(--accent-cyan);">${det.id}</td>
        <td>${formatDate(det.timestamp)}</td>
        <td><span class="badge ${badgeClass}">${det.severity}</span></td>
        <td>${det.category}</td>
        <td style="font-weight: 500;">${det.asset}</td>
        <td>${det.user}</td>
        <td><span class="score-indicator ${badgeClass}">${det.riskScore}</span></td>
        <td style="font-family: var(--font-mono);">${det.confidence}%</td>
        <td><span class="badge ${statusBadgeClass}">${det.status}</span></td>
      `;

      // Prevent checkbox clicks from opening drawer
      tr.querySelector('.table-checkbox').addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Row Click -> Open Drawer
      tr.addEventListener('click', () => {
        openDetectionDrawer(det);
      });

      tableBody.appendChild(tr);
    });
  }

  function openDetectionDrawer(det) {
    if (!drawer) return;

    drawerId.textContent = det.id;
    drawerTitle.textContent = det.category;
    
    drawerSeverity.textContent = det.severity;
    drawerSeverity.className = `badge ${det.severity.toLowerCase()}`;
    
    drawerRiskScore.textContent = `Risk: ${det.riskScore}`;
    drawerRiskScore.className = `score-indicator ${det.riskScore >= 90 ? 'critical' : det.riskScore >= 70 ? 'high' : 'medium'}`;
    
    drawerConfidence.textContent = `Confidence: ${det.confidence}%`;
    drawerReason.textContent = det.reason;
    drawerObserved.textContent = det.evidence.observed;
    drawerInference.textContent = det.evidence.inference;
    drawerNextSteps.textContent = det.evidence.nextSteps;

    drawer.classList.add('open');
  }

  function syncFiltersUI() {
    const { filters } = stateManager.state;
    
    // Sync severity filter pills
    severityFilters.querySelectorAll('.filter-pill').forEach(pill => {
      if (pill.getAttribute('data-severity') === filters.severity) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // Sync search box
    if (searchInput.value !== filters.searchQuery) {
      searchInput.value = filters.searchQuery;
    }
  }
}
