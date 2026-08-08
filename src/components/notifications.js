import { stateManager } from '../state.js';
import { formatDate, showToast } from './utils.js';

export function initNotifications() {
  const notifBtn = document.getElementById('notifBtn');
  const dropdown = document.getElementById('notifDropdown');
  const dropdownList = document.getElementById('notifDropdownList');
  const badge = document.getElementById('notifBadge');
  const clearAllBtn = document.getElementById('clearAllNotifs');

  if (!notifBtn || !dropdown || !dropdownList || !badge) return;

  // Toggle Dropdown on Bell Click
  notifBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  // Close dropdown on click outside
  window.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Dismiss All notifications
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      stateManager.state.notifications = [];
      stateManager.notify('notificationsChanged', []);
      showToast('All notifications dismissed.', 'success');
    });
  }

  // Subscribe to updates
  stateManager.subscribe('notificationsChanged', renderNotifications);

  // Initial draw
  renderNotifications();

  function renderNotifications() {
    const { notifications } = stateManager.state;
    dropdownList.innerHTML = '';

    const unreadCount = notifications.filter(n => !n.read).length;
    if (unreadCount > 0) {
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }

    if (notifications.length === 0) {
      dropdownList.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-secondary); font-size: 0.85rem;">
          No active notifications registered.
        </div>
      `;
      return;
    }

    notifications.forEach(notif => {
      const item = document.createElement('div');
      item.className = `notif-item ${!notif.read ? 'unread' : ''}`;
      
      let badgeClass = 'low';
      if (notif.severity === 'Critical') badgeClass = 'critical';
      else if (notif.severity === 'High') badgeClass = 'high';
      else if (notif.severity === 'Medium') badgeClass = 'medium';

      item.innerHTML = `
        <div style="margin-top:2px;"><span class="badge ${badgeClass}" style="padding:2px 4px; font-size:0.6rem;">${notif.severity}</span></div>
        <div class="notif-item-body">
          <div class="notif-item-text">${notif.text}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
            <span class="notif-item-time">${formatDate(notif.timestamp)}</span>
            <div style="display:flex; gap:6px;">
              ${!notif.read ? `<button class="btn-secondary mark-read-btn" style="padding:2px 6px; font-size:0.7rem;" data-notif-id="${notif.id}">Read</button>` : ''}
              <button class="btn-secondary dismiss-btn" style="padding:2px 6px; font-size:0.7rem; color:var(--status-critical);" data-notif-id="${notif.id}">Dismiss</button>
            </div>
          </div>
        </div>
      `;

      // Bind Mark-Read Event
      const readBtn = item.querySelector('.mark-read-btn');
      if (readBtn) {
        readBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          stateManager.markNotificationRead(notif.id);
        });
      }

      // Bind Dismiss Event
      item.querySelector('.dismiss-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        stateManager.markNotificationResolved(notif.id);
      });

      // Item click -> Navigate to asset details
      item.addEventListener('click', () => {
        const asset = stateManager.state.assets.find(a => a.name === notif.asset);
        if (asset) {
          stateManager.setSelectedAsset(asset.id);
          stateManager.setView('assets');
          dropdown.classList.remove('open');
        } else {
          stateManager.setView('detections');
          dropdown.classList.remove('open');
        }
        stateManager.markNotificationRead(notif.id);
      });

      dropdownList.appendChild(item);
    });
  }
}
