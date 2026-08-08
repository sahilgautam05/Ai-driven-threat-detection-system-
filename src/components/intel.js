import { stateManager } from '../state.js';
import { formatDate } from './utils.js';

export function initThreatIntel() {
  const intelTableBody = document.getElementById('intelTableBody');
  const searchInput = document.getElementById('intelSearch');

  if (!intelTableBody || !searchInput) return;

  // Render initial feeds
  renderIntelTable();

  // Redraw if state intel list is changed
  stateManager.subscribe('intelChanged', renderIntelTable);

  // Search input typing filter
  searchInput.addEventListener('input', renderIntelTable);

  function getFilteredIntel() {
    const { intel } = stateManager.state;
    const query = searchInput.value.trim().toLowerCase();

    return intel.filter(i => {
      if (!query) return true;
      return (
        i.indicator.toLowerCase().includes(query) ||
        i.type.toLowerCase().includes(query) ||
        i.reputation.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query) ||
        i.relatedActors.toLowerCase().includes(query) ||
        i.source.toLowerCase().includes(query)
      );
    });
  }

  function renderIntelTable() {
    const filtered = getFilteredIntel();
    intelTableBody.innerHTML = '';

    if (filtered.length === 0) {
      intelTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 40px 0;">
            No indicators match the threat intelligence query.
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(item => {
      const tr = document.createElement('tr');
      
      let repBadgeClass = 'low';
      if (item.reputation === 'Malicious') repBadgeClass = 'critical';
      else if (item.reputation === 'Suspicious') repBadgeClass = 'high';

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight:600; color: var(--text-primary);">${item.indicator}</td>
        <td style="color:var(--text-secondary); font-size:0.85rem;">${item.type}</td>
        <td><span class="badge ${repBadgeClass}">${item.reputation}</span></td>
        <td style="font-size:0.875rem;">${item.category}</td>
        <td style="font-family: var(--font-mono); font-weight:600;">${item.confidence}%</td>
        <td style="color:var(--accent-purple-glowing); font-weight:500;">${item.relatedActors}</td>
        <td style="color:var(--text-muted); font-size:0.8rem;">${item.source}</td>
      `;

      intelTableBody.appendChild(tr);
    });
  }
}
