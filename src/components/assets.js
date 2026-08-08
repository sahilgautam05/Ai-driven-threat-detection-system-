import { stateManager } from '../state.js';
import { showToast, formatDate } from './utils.js';

export function initAssets() {
  const assetsListView = document.getElementById('assetsListView');
  const assetDetailView = document.getElementById('assetDetailView');
  const cardsGrid = document.getElementById('assetsCardsGrid');
  const categoryFilters = document.getElementById('assetCategoryFilters');
  const searchInput = document.getElementById('assetSearch');
  
  // Detail elements
  const backBtn = document.getElementById('backToAssetsListBtn');
  const detailName = document.getElementById('detailAssetName');
  const detailHealth = document.getElementById('detailAssetHealth');
  const detailType = document.getElementById('detailAssetType');
  const detailIp = document.getElementById('detailAssetIp');
  const detailOs = document.getElementById('detailAssetOs');
  const detailCloud = document.getElementById('detailAssetCloud');
  const detailImportance = document.getElementById('detailAssetImportance');
  const detailRisk = document.getElementById('detailAssetRisk');
  const detailLogsBody = document.getElementById('detailAssetLogsBody');
  const isolateBtn = document.getElementById('isolateAssetDetailBtn');

  if (!cardsGrid || !categoryFilters || !searchInput) return;

  // Render cards
  renderAssetCards();

  // Subscribe to updates
  stateManager.subscribe('assetsChanged', () => {
    renderAssetCards();
    if (stateManager.state.selectedAssetId) {
      updateAssetDetailPane();
    }
  });
  stateManager.subscribe('detectionsChanged', renderAssetCards);

  // Category filter tabs
  categoryFilters.addEventListener('click', (e) => {
    const pill = e.target.closest('.filter-pill');
    if (!pill) return;

    categoryFilters.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');

    const cat = pill.getAttribute('data-category');
    stateManager.setFilter('assetCategory', cat);
    renderAssetCards();
  });

  // Search input typing
  searchInput.addEventListener('input', () => {
    renderAssetCards();
  });

  // Back to list button
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      stateManager.setSelectedAsset(null);
      assetDetailView.style.display = 'none';
      assetsListView.style.display = 'block';
    });
  }

  // Isolation button in detail view
  if (isolateBtn) {
    isolateBtn.addEventListener('click', () => {
      const { assets, selectedAssetId } = stateManager.state;
      const asset = assets.find(a => a.id === selectedAssetId);
      if (asset) {
        asset.health = 'isolated';
        asset.riskScore = 10;
        stateManager.notify('assetsChanged', assets);
        showToast(`Quarantined asset ${asset.name}. Egress firewall block enabled.`, 'success');
        stateManager.logAction('EDR Agent', `Triggered network firewall containment for asset: ${asset.name}`, asset.ip);
      }
    });
  }

  // Subscribe to selection event
  stateManager.subscribe('assetSelected', (assetId) => {
    if (assetId) {
      assetsListView.style.display = 'none';
      assetDetailView.style.display = 'block';
      updateAssetDetailPane();
    }
  });

  function getFilteredAssets() {
    const { assets, filters } = stateManager.state;
    const activeCategory = filters.assetCategory || 'All';
    const query = searchInput.value.trim().toLowerCase();

    return assets.filter(a => {
      // 1. Category check
      if (activeCategory !== 'All' && a.category !== activeCategory) return false;

      // 2. Search check
      if (query) {
        const matchesQuery = 
          a.name.toLowerCase().includes(query) ||
          a.ip.toLowerCase().includes(query) ||
          a.type.toLowerCase().includes(query) ||
          a.importance.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      return true;
    });
  }

  function renderAssetCards() {
    const filtered = getFilteredAssets();
    cardsGrid.innerHTML = '';

    if (filtered.length === 0) {
      cardsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 40px 0;">
          No assets match the search query or selected category.
        </div>
      `;
      return;
    }

    filtered.forEach(asset => {
      const card = document.createElement('div');
      card.className = `glass-card ${asset.health === 'critical' ? 'critical-glow' : ''}`;
      card.style.cursor = 'pointer';

      let statusBadge = 'low';
      if (asset.health === 'critical') statusBadge = 'critical';
      else if (asset.health === 'warning') statusBadge = 'high';
      else if (asset.health === 'isolated') statusBadge = 'active';

      // Count actual alerts for this asset
      const activeAlerts = stateManager.state.detections.filter(d => d.asset === asset.name && d.status !== 'Resolved').length;

      card.innerHTML = `
        <div class="card-header" style="margin-bottom:12px;">
          <span style="font-weight:600; font-size:0.95rem;">${asset.name}</span>
          <span class="badge ${statusBadge}">${asset.health}</span>
        </div>
        <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:6px; margin-bottom:14px;">
          <div><strong>IP:</strong> ${asset.ip}</div>
          <div><strong>Class:</strong> ${asset.type}</div>
          <div><strong>Criticality:</strong> ${asset.importance}</div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px dashed rgba(255,255,255,0.05); padding-top:10px;">
          <span style="font-size:0.75rem; color:var(--text-muted);">Alerts: <strong style="color:${activeAlerts > 0 ? 'var(--status-critical)' : 'var(--text-muted)'};">${activeAlerts}</strong></span>
          <span class="score-indicator ${asset.riskScore >= 80 ? 'critical' : asset.riskScore >= 50 ? 'high' : 'medium'}">Risk: ${asset.riskScore}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        stateManager.setSelectedAsset(asset.id);
      });

      cardsGrid.appendChild(card);
    });
  }

  function updateAssetDetailPane() {
    const { assets, detections, selectedAssetId } = stateManager.state;
    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset) return;

    // Set Text fields
    detailName.textContent = asset.name;
    detailType.textContent = asset.type;
    detailIp.textContent = asset.ip;
    detailOs.textContent = asset.os;
    detailCloud.textContent = `${asset.cloudProvider} (${asset.region})`;
    detailImportance.textContent = asset.importance;
    detailRisk.textContent = asset.riskScore;

    // Health badge
    let statusBadge = 'low';
    if (asset.health === 'critical') statusBadge = 'critical';
    else if (asset.health === 'warning') statusBadge = 'high';
    else if (asset.health === 'isolated') statusBadge = 'active';
    
    detailHealth.textContent = asset.health;
    detailHealth.className = `badge ${statusBadge}`;

    // Adjust isolation button
    if (asset.health === 'isolated') {
      isolateBtn.textContent = 'Asset Isolated (Containment Active)';
      isolateBtn.disabled = true;
      isolateBtn.style.background = 'rgba(255,255,255,0.05)';
      isolateBtn.style.color = 'var(--text-muted)';
      isolateBtn.style.cursor = 'not-allowed';
      isolateBtn.style.boxShadow = 'none';
    } else {
      isolateBtn.textContent = 'Initiate Firewall Isolation';
      isolateBtn.disabled = false;
      isolateBtn.style.background = 'linear-gradient(135deg, var(--status-critical) 0%, rgba(255, 59, 48, 0.7) 100%)';
      isolateBtn.style.color = 'white';
      isolateBtn.style.cursor = 'pointer';
    }

    // Populate alert event logs for this asset
    const assetDetections = detections.filter(d => d.asset === asset.name);
    detailLogsBody.innerHTML = '';

    if (assetDetections.length === 0) {
      detailLogsBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align:center; color:var(--text-muted); padding:20px 0;">No security events registered for this asset.</td>
        </tr>
      `;
      return;
    }

    assetDetections.forEach(det => {
      const tr = document.createElement('tr');
      tr.style.cursor = 'pointer';
      
      let badgeClass = 'low';
      if (det.severity === 'Critical') badgeClass = 'critical';
      else if (det.severity === 'High') badgeClass = 'high';
      else if (det.severity === 'Medium') badgeClass = 'medium';

      tr.innerHTML = `
        <td style="font-family:var(--font-mono); font-size:0.8rem;">${formatDate(det.timestamp)}</td>
        <td>${det.category}</td>
        <td><span class="badge ${badgeClass}">${det.severity}</span></td>
        <td style="white-space:normal; font-size:0.85rem;">${det.reason}</td>
      `;

      // Click event to open drawer
      tr.addEventListener('click', () => {
        const drawer = document.getElementById('detailsDrawer');
        if (drawer) {
          document.getElementById('drawerId').textContent = det.id;
          document.getElementById('drawerTitle').textContent = det.category;
          
          const sev = document.getElementById('drawerSeverity');
          sev.textContent = det.severity;
          sev.className = `badge ${det.severity.toLowerCase()}`;
          
          const risk = document.getElementById('drawerRiskScore');
          risk.textContent = `Risk: ${det.riskScore}`;
          risk.className = `score-indicator ${det.riskScore >= 90 ? 'critical' : det.riskScore >= 70 ? 'high' : 'medium'}`;

          document.getElementById('drawerConfidence').textContent = `Conf: ${det.confidence}%`;
          document.getElementById('drawerReason').textContent = det.reason;
          document.getElementById('drawerObserved').textContent = det.evidence.observed;
          document.getElementById('drawerInference').textContent = det.evidence.inference;
          document.getElementById('drawerNextSteps').textContent = det.evidence.nextSteps;

          drawer.classList.add('open');
        }
      });

      detailLogsBody.appendChild(tr);
    });
  }
}
