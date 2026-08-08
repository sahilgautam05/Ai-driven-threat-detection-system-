import { stateManager } from '../state.js';
import { showToast } from './utils.js';

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const appWrapper = document.getElementById('appWrapper');
  const navItems = document.querySelectorAll('.nav-item');
  const breadcrumbView = document.getElementById('breadcrumb-view');
  const logoClick = document.getElementById('logoClick');
  const orgSelector = document.getElementById('orgSelector');
  const activeOrgName = document.getElementById('activeOrgName');

  if (!sidebarToggle || !appWrapper) return;

  // Toggle Sidebar Collapse
  sidebarToggle.addEventListener('click', () => {
    const isCollapsed = appWrapper.classList.toggle('sidebar-collapsed');
    stateManager.setSidebarCollapsed(isCollapsed);
    
    // Update button chevron icon rotation
    if (isCollapsed) {
      sidebarToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="13 17 18 12 13 7"></polyline>
          <polyline points="6 17 11 12 6 7"></polyline>
        </svg>
      `;
    } else {
      sidebarToggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      `;
    }
  });

  // Navigate on Item Click
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      stateManager.setView(view);
    });
  });

  // Logo navigates to Overview
  if (logoClick) {
    logoClick.addEventListener('click', () => {
      stateManager.setView('overview');
    });
  }

  // Tenant Organization Switcher
  if (orgSelector && activeOrgName) {
    const orgs = ["Sentinel Global Security", "Acme Corp Operations", "Sector-7 Security Hub"];
    let currentIdx = 0;
    
    orgSelector.addEventListener('click', () => {
      currentIdx = (currentIdx + 1) % orgs.length;
      const nextOrg = orgs[currentIdx];
      activeOrgName.textContent = nextOrg.split(' ')[0] + ' ' + (nextOrg.split(' ')[1] || '');
      stateManager.setActiveOrg(nextOrg);
      showToast(`Switched workspace to ${nextOrg}`, 'success');
    });
    
    // Sync with state changes (e.g. from command palette or settings page)
    stateManager.subscribe('orgChanged', (org) => {
      activeOrgName.textContent = org.split(' ')[0] + ' ' + (org.split(' ')[1] || '');
      currentIdx = orgs.indexOf(org);
    });
  }

  // Subscribe to Global Navigation State Changes
  stateManager.subscribe('viewChanged', (view) => {
    // 1. Update navigation active state classes
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === view) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 2. Update breadcrumbs display
    const label = document.getElementById(`nav-${view}`)?.querySelector('.nav-text')?.textContent || 'Overview';
    breadcrumbView.textContent = label;
    
    // 3. Switch visible HTML section class
    const views = document.querySelectorAll('.workspace-view');
    views.forEach(section => {
      if (section.id === `${view}-view`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
  });
}
