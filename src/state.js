import {
  INITIAL_ASSETS,
  INITIAL_DETECTIONS,
  INITIAL_INCIDENTS,
  INITIAL_RULES,
  INITIAL_INTEL,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS
} from './data.js';

class StateCoordinator {
  constructor() {
    this.subscribers = {};
    
    // Load from SessionStorage or fallback to default mock telemetry
    this.state = {
      currentView: 'overview',
      selectedIncidentId: 'INC-2048',
      selectedAssetId: null,
      filters: {
        severity: 'All',
        category: 'All',
        searchQuery: '',
        asset: 'All',
        user: 'All',
        source: 'All'
      },
      userRole: 'Analyst', // Analyst, Admin, Auditor
      activeOrg: 'Sentinel Global Security',
      sidebarCollapsed: false,
      
      assets: [...INITIAL_ASSETS],
      detections: [...INITIAL_DETECTIONS],
      incidents: [...INITIAL_INCIDENTS],
      rules: [...INITIAL_RULES],
      intel: [...INITIAL_INTEL],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      
      copilotMessages: [
        {
          id: 'm1',
          sender: 'copilot',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          text: "Welcome to Sentinel Copilot. I've analyzed your telemetry and isolated a **Critical Incident (#INC-2048)**. How can I assist you with your investigation today?",
          citations: []
        }
      ]
    };
  }

  // Pub/Sub Implementation
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(callback => {
        try {
          callback(data, this.state);
        } catch (e) {
          console.error(`Error in state notification for event: ${event}`, e);
        }
      });
    }
  }

  // State modification actions
  setView(view) {
    this.state.currentView = view;
    this.notify('viewChanged', view);
    this.logAction('Navigation', `Navigated to ${view} workspace`, 'Navigation System');
  }

  setSidebarCollapsed(collapsed) {
    this.state.sidebarCollapsed = collapsed;
    this.notify('sidebarChanged', collapsed);
  }

  setSelectedIncident(incidentId) {
    this.state.selectedIncidentId = incidentId;
    this.notify('incidentSelected', incidentId);
    this.logAction('Incident Manager', `Selected incident ${incidentId} for inspection`, 'Analyst Workspace');
  }

  setSelectedAsset(assetId) {
    this.state.selectedAssetId = assetId;
    this.notify('assetSelected', assetId);
  }

  setFilter(key, value) {
    this.state.filters[key] = value;
    this.notify('filtersChanged', this.state.filters);
  }

  resetFilters() {
    this.state.filters = {
      severity: 'All',
      category: 'All',
      searchQuery: '',
      asset: 'All',
      user: 'All',
      source: 'All'
    };
    this.notify('filtersChanged', this.state.filters);
  }

  setUserRole(role) {
    this.state.userRole = role;
    this.notify('roleChanged', role);
    this.logAction('Identity & Access', `Switched user role to ${role}`, 'Security Control Panel');
  }

  setActiveOrg(org) {
    this.state.activeOrg = org;
    this.notify('orgChanged', org);
    this.logAction('Identity & Access', `Switched workspace organization to ${org}`, 'Tenant Switcher');
  }

  // Notifications
  markNotificationRead(id) {
    const notif = this.state.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.notify('notificationsChanged', this.state.notifications);
    }
  }

  markNotificationResolved(id) {
    this.state.notifications = this.state.notifications.filter(n => n.id !== id);
    this.notify('notificationsChanged', this.state.notifications);
    this.logAction('Alert Notifications', `Dismissed / Resolved alert notification ${id}`, 'Notification Panel');
  }

  // Rules CRUD
  saveRule(rule) {
    if (rule.id) {
      // Edit
      this.state.rules = this.state.rules.map(r => r.id === rule.id ? { ...r, ...rule, updatedDate: new Date().toISOString().split('T')[0] } : r);
      this.logAction('Detection Rules', `Modified rule ${rule.name} (${rule.id})`, 'Rule Editor');
    } else {
      // Add new
      const newRule = {
        ...rule,
        id: `R-${Math.floor(100 + Math.random() * 900)}`,
        detectionsCount: 0,
        createdBy: `${this.state.userRole} (User)`,
        updatedDate: new Date().toISOString().split('T')[0],
        lastTriggered: 'Never'
      };
      this.state.rules.unshift(newRule);
      this.logAction('Detection Rules', `Created new detection rule: ${newRule.name}`, 'Rule Editor');
    }
    this.notify('rulesChanged', this.state.rules);
  }

  deleteRule(id) {
    const rule = this.state.rules.find(r => r.id === id);
    this.state.rules = this.state.rules.filter(r => r.id !== id);
    this.logAction('Detection Rules', `Deleted rule ${rule ? rule.name : id} (${id})`, 'Rule Editor');
    this.notify('rulesChanged', this.state.rules);
  }

  toggleRuleStatus(id) {
    const rule = this.state.rules.find(r => r.id === id);
    if (rule) {
      rule.status = !rule.status;
      this.logAction('Detection Rules', `${rule.status ? 'Enabled' : 'Disabled'} rule ${rule.name}`, 'Rule Manager');
      this.notify('rulesChanged', this.state.rules);
    }
  }

  // Copilot messages
  addCopilotMessage(sender, text, citations = []) {
    const msg = {
      id: `m-${Math.random().toString(36).substr(2, 9)}`,
      sender,
      timestamp: new Date().toISOString(),
      text,
      citations
    };
    this.state.copilotMessages.push(msg);
    this.notify('copilotMessagesChanged', this.state.copilotMessages);
  }

  clearCopilotMessages() {
    this.state.copilotMessages = [
      {
        id: 'm-default',
        sender: 'copilot',
        timestamp: new Date().toISOString(),
        text: "Copilot session cleared. Ready for your security queries.",
        citations: []
      }
    ];
    this.notify('copilotMessagesChanged', this.state.copilotMessages);
  }

  // Audit Logger
  logAction(category, action, resource) {
    const newLog = {
      timestamp: new Date().toISOString(),
      actor: `${this.state.userRole.toLowerCase()}@sentinel.ai`,
      role: this.state.userRole,
      action,
      resource
    };
    this.state.auditLogs.unshift(newLog);
    this.notify('auditLogsChanged', this.state.auditLogs);
  }
}

export const stateManager = new StateCoordinator();
