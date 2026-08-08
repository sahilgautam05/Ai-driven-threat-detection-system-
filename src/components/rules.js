import { stateManager } from '../state.js';
import { showToast } from './utils.js';

export function initRulesEditor() {
  const tableBody = document.getElementById('rulesTableBody');
  const createRuleBtn = document.getElementById('createNewRuleBtn');
  
  // Modal Elements
  const modal = document.getElementById('ruleModal');
  const closeBtn = document.getElementById('closeRuleModalBtn');
  const cancelBtn = document.getElementById('cancelRuleSaveBtn');
  const saveBtn = document.getElementById('saveRuleBtn');
  
  // Form fields
  const formId = document.getElementById('ruleFormId');
  const formName = document.getElementById('ruleName');
  const formCategory = document.getElementById('ruleCategory');
  const formSeverity = document.getElementById('ruleSeverity');
  const formDescription = document.getElementById('ruleDescription');
  const modalTitle = document.getElementById('ruleModalTitle');

  if (!tableBody || !modal || !saveBtn) return;

  // Render initial list
  renderRulesTable();

  // Subscribe to state updates
  stateManager.subscribe('rulesChanged', renderRulesTable);

  // Open Create Modal
  if (createRuleBtn) {
    createRuleBtn.addEventListener('click', () => {
      modalTitle.textContent = "Create Detection Rule";
      formId.value = "";
      formName.value = "";
      formCategory.value = "Credential abuse";
      formSeverity.value = "Critical";
      formDescription.value = "";
      modal.classList.add('open');
    });
  }

  // Close Modals
  const closeModal = () => {
    modal.classList.remove('open');
  };
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Save Rule Event
  saveBtn.addEventListener('click', () => {
    const name = formName.value.trim();
    const desc = formDescription.value.trim();
    const cat = formCategory.value;
    const sev = formSeverity.value;
    const id = formId.value;

    if (!name || !desc) {
      showToast('Validation Error: Rule Name and Description details cannot be blank.', 'critical');
      return;
    }

    const ruleData = {
      name,
      description: desc,
      category: cat,
      severity: sev,
      status: true
    };

    if (id) {
      ruleData.id = id;
    }

    stateManager.saveRule(ruleData);
    showToast(id ? 'Rule modified successfully.' : 'New detection rule created.', 'success');
    closeModal();
  });

  function renderRulesTable() {
    const { rules } = stateManager.state;
    tableBody.innerHTML = '';

    rules.forEach(rule => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'low';
      if (rule.severity === 'Critical') badgeClass = 'critical';
      else if (rule.severity === 'High') badgeClass = 'high';
      else if (rule.severity === 'Medium') badgeClass = 'medium';

      tr.innerHTML = `
        <td style="font-weight:600; color:var(--text-primary);">${rule.name}</td>
        <td style="font-size:0.85rem; color:var(--text-secondary);">${rule.category}</td>
        <td><span class="badge ${badgeClass}">${rule.severity}</span></td>
        <td style="font-family:var(--font-mono); font-weight:500;">${rule.detectionsCount}</td>
        <td style="color:var(--text-secondary); font-size:0.8rem;">${rule.lastTriggered}</td>
        <td style="font-size:0.85rem;">${rule.createdBy}</td>
        <td style="font-family:var(--font-mono); font-size:0.8rem;">${rule.updatedDate}</td>
        <td>
          <button class="btn-secondary toggle-rule-btn" style="padding:4px 8px; font-size:0.75rem;" data-rule-id="${rule.id}">
            ${rule.status ? '● Active (Enabled)' : '○ Disabled'}
          </button>
        </td>
        <td>
          <div style="display:flex; gap:6px;">
            <button class="btn-secondary edit-rule-btn" style="padding:4px;" data-rule-id="${rule.id}" title="Edit Rule">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn-secondary delete-rule-btn" style="padding:4px; color:var(--status-critical);" data-rule-id="${rule.id}" title="Delete Rule">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
      `;

      // Bind Row Toggle status event
      tr.querySelector('.toggle-rule-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        stateManager.toggleRuleStatus(rule.id);
        showToast(`${rule.status ? 'Disabled' : 'Enabled'} detection rule: ${rule.name}`, 'info');
      });

      // Bind Row Edit event
      tr.querySelector('.edit-rule-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        modalTitle.textContent = "Edit Detection Rule";
        formId.value = rule.id;
        formName.value = rule.name;
        formCategory.value = rule.category;
        formSeverity.value = rule.severity;
        formDescription.value = rule.description;
        modal.classList.add('open');
      });

      // Bind Row Delete event
      tr.querySelector('.delete-rule-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Are you sure you want to delete the detection rule: "${rule.name}"? This action is registered in the auditor audit logs.`)) {
          stateManager.deleteRule(rule.id);
          showToast(`Deleted detection rule: ${rule.name}`, 'critical');
        }
      });

      tableBody.appendChild(tr);
    });
  }
}
