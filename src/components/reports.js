import { stateManager } from '../state.js';
import { showToast, formatDate } from './utils.js';

export function initReports() {
  const panel = document.getElementById('generatedReportOutput');
  const closeBtn = document.getElementById('closeReportBtn');
  const printBtn = document.getElementById('printReportBtn');
  const titleText = document.getElementById('reportTitleText');
  const metaText = document.getElementById('reportMetaText');
  const docContent = document.getElementById('reportDocumentContent');

  // Trigger buttons
  const btnDaily = document.getElementById('genReportDaily');
  const btnExec = document.getElementById('genReportExec');
  const btnIncident = document.getElementById('genReportIncident');
  const btnCompliance = document.getElementById('genReportCompliance');

  if (!panel || !docContent) return;

  const showReport = (title, content) => {
    titleText.textContent = title;
    metaText.textContent = `Generated on ${formatDate(new Date().toISOString())} by Sentinel AI Copilot Engine`;
    docContent.innerHTML = content;
    
    // Smooth scroll down
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth' });
    
    showToast(`Compiled report: "${title}"`, 'success');
    stateManager.logAction('Reports Manager', `Generated security document: ${title}`, 'Reports Workbench');
  };

  // Close report
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  // Print report
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // Create temporary print window or styling focus
      window.print();
    });
  }

  // 1. Daily Report Generator
  if (btnDaily) {
    btnDaily.addEventListener('click', () => {
      const { detections, incidents } = stateManager.state;
      const critical = detections.filter(d => d.severity === 'Critical').length;
      const high = detections.filter(d => d.severity === 'High').length;
      
      const html = `
        <div style="font-family:var(--font-sans); display:flex; flex-direction:column; gap:20px;">
          <p>This report summarizes the operational status and telemetry ingested by the security operations center (SOC) over the preceding 24-hour cycle.</p>
          
          <h4 style="color:var(--accent-cyan); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">1. Operational Metrics Summary</h4>
          <table style="width:100%; border-collapse:collapse; font-size:0.875rem;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                <th style="padding:8px 0;">Metric Parameter</th>
                <th style="padding:8px 0; text-align:right;">Registered Total</th>
                <th style="padding:8px 0; text-align:right;">Comparison vs Baseline</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
                <td style="padding:8px 0;">Total Telemetry Packets Logged</td>
                <td style="padding:8px 0; text-align:right; font-family:var(--font-mono);">1,482,925</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-safe);">+1.2% (Normal Deviation)</td>
              </tr>
              <tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
                <td style="padding:8px 0;">Correlated Threat Detections</td>
                <td style="padding:8px 0; text-align:right; font-family:var(--font-mono);">${detections.length}</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-critical);">+14.8% (Incident Campaign Active)</td>
              </tr>
              <tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
                <td style="padding:8px 0;">Critical Warnings Flags</td>
                <td style="padding:8px 0; text-align:right; font-family:var(--font-mono); color:var(--status-critical); font-weight:600;">${critical}</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-critical);">+400% (Anomalous Spikes)</td>
              </tr>
              <tr>
                <td style="padding:8px 0;">Resolved security tickets</td>
                <td style="padding:8px 0; text-align:right; font-family:var(--font-mono); color:var(--status-safe);">${detections.filter(d => d.status === 'Resolved').length}</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-safe);">+20.4%</td>
              </tr>
            </tbody>
          </table>

          <h4 style="color:var(--accent-cyan); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">2. AI Anomaly Core Inferences</h4>
          <p style="background:rgba(188,0,221,0.05); border-left:4px solid var(--accent-purple); padding:12px; border-radius:4px; line-height:1.5;">
            <strong>Correlation Logic:</strong> The engine matched Kerberos authentication credential failures followed by process elevation execution scripts and cloud exfiltration egress volumes. Posture index fell by 18 points but remains contained. Immediate isolation tasks successfully executed on targets srv-prod-db-01.
          </p>
        </div>
      `;
      showReport("Daily SOC Security Summary", html);
    });
  }

  // 2. Executive Report Generator
  if (btnExec) {
    btnExec.addEventListener('click', () => {
      const html = `
        <div style="font-family:var(--font-sans); display:flex; flex-direction:column; gap:20px;">
          <h4 style="color:var(--accent-purple-glowing);">EXECUTIVE THREAT POSTURE REVIEW</h4>
          <p>This report highlights security changes, posture score updates, and critical threat actor campaigns identified within organizational infrastructure.</p>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
            <div style="background:rgba(0,240,255,0.03); padding:16px; border:1px solid var(--border-color); border-radius:8px;">
              <h5 style="color:var(--accent-cyan); margin-bottom:8px;">Active Exposure Factors</h5>
              <ul style="padding-left:16px; display:flex; flex-direction:column; gap:6px; font-size:0.85rem;">
                <li>Compromise of Tier-1 Active Directory Account credentials</li>
                <li>Production Customer Database egress anomaly peak</li>
                <li>Tor-routed developer session concurrent geo-access mismatch</li>
              </ul>
            </div>
            <div style="background:rgba(188,0,221,0.03); padding:16px; border:1px solid rgba(188,0,221,0.2); border-radius:8px;">
              <h5 style="color:var(--accent-purple-glowing); margin-bottom:8px;">Remediation Cost Mitigation</h5>
              <ul style="padding-left:16px; display:flex; flex-direction:column; gap:6px; font-size:0.85rem;">
                <li>Network quarantine isolated database host in under 8 minutes</li>
                <li>Credential multi-factor validation resets prompted globally</li>
                <li>Zero ransom demands registered; backups remain uncompromised</li>
              </ul>
            </div>
          </div>

          <h4 style="color:var(--accent-cyan); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">Threat Actor Context Mapping</h4>
          <p style="font-size:0.9rem; line-height:1.5;">
            Attribution indicates alignment with Cozy Bear (APT-29) tactics utilizing valid account credentials (T1078) to pivot from workstations into high-value database servers, then leveraging Alternate Protocol Exfiltration streams (T1048). Outbound Dutch hosting block IPs are blacklisted.
          </p>
        </div>
      `;
      showReport("Executive Threat Briefing", html);
    });
  }

  // 3. Incident Audit Report
  if (btnIncident) {
    btnIncident.addEventListener('click', () => {
      const activeInc = stateManager.state.incidents.find(i => i.id === stateManager.state.selectedIncidentId) || stateManager.state.incidents[0];
      
      const html = `
        <div style="font-family:var(--font-sans); display:flex; flex-direction:column; gap:20px;">
          <h4 style="color:var(--status-critical); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">Forensic Audit: ${activeInc.id}</h4>
          
          <div style="background:rgba(255,255,255,0.02); padding:16px; border:1px solid var(--border-color); border-radius:8px; font-size:0.875rem;">
            <div><strong>Incident Category:</strong> Multi-Stage Database Compromise Campaign</div>
            <div><strong>Severity rating:</strong> Critical (Risk score: ${activeInc.riskScore})</div>
            <div><strong>First event registered:</strong> ${formatDate(activeInc.firstDetected)}</div>
            <div><strong>Assigned Investigator:</strong> ${activeInc.assignedAnalyst}</div>
          </div>

          <h4 style="color:var(--accent-cyan); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">Root Cause Timeline Analysis</h4>
          <ol style="padding-left:20px; font-size:0.9rem; display:flex; flex-direction:column; gap:10px;">
            ${activeInc.timeline.map(t => `
              <li><strong>[${t.time} UTC] - ${t.event}</strong>: ${t.details}</li>
            `).join('')}
          </ol>

          <h4 style="color:var(--accent-cyan); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">Containment Checklist & Controls</h4>
          <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                <th style="padding:6px 0;">Containment Task Control</th>
                <th style="padding:6px 0;">Triggered Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:6px 0;">Quarantine Database host srv-prod-db-01</td>
                <td style="padding:6px 0; color:var(--status-safe); font-weight:600;">ACTIVE (EDR Containment)</td>
              </tr>
              <tr>
                <td style="padding:6px 0;">Blacklist egress destination IP 203.0.113.110</td>
                <td style="padding:6px 0; color:var(--status-safe); font-weight:600;">ACTIVE (Firewall Policy)</td>
              </tr>
              <tr>
                <td style="padding:6px 0;">Revoke OAuth session credentials for admin.svc</td>
                <td style="padding:6px 0; color:var(--status-high); font-weight:600;">PENDING MANUAL RESET</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      showReport(`Audit Report: ${activeInc.id}`, html);
    });
  }

  // 4. Compliance Report
  if (btnCompliance) {
    btnCompliance.addEventListener('click', () => {
      const html = `
        <div style="font-family:var(--font-sans); display:flex; flex-direction:column; gap:20px;">
          <h4 style="color:var(--status-safe); border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px;">NIST / ISO27001 Regulatory Alignment Map</h4>
          <p>Validates organizational detection logic and security response tools mapped to compliance metrics.</p>

          <table style="width:100%; border-collapse:collapse; font-size:0.875rem;">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1); text-align:left;">
                <th style="padding:8px 0;">Regulatory Code</th>
                <th style="padding:8px 0;">Description control</th>
                <th style="padding:8px 0;">Validation Proof</th>
                <th style="padding:8px 0; text-align:right;">Audit Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
                <td style="padding:8px 0; font-family:var(--font-mono); font-weight:600;">NIST DE.AE-2</td>
                <td style="padding:8px 0;">Events are analyzed to understand threat impacts and vectors</td>
                <td style="padding:8px 0;">Sentinel Correlation engine and AI analysis outputs</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-safe); font-weight:600;">COMPLIANT</td>
              </tr>
              <tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
                <td style="padding:8px 0; font-family:var(--font-mono); font-weight:600;">NIST RS.CO-1</td>
                <td style="padding:8px 0;">Incidents are reported to legal teams and clients</td>
                <td style="padding:8px 0;">Exported PDF briefs and audit trail logs database</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-safe); font-weight:600;">COMPLIANT</td>
              </tr>
              <tr style="border-bottom:1px dashed rgba(255,255,255,0.05);">
                <td style="padding:8px 0; font-family:var(--font-mono); font-weight:600;">ISO A.12.6.1</td>
                <td style="padding:8px 0;">Management of technical vulnerabilities in networks</td>
                <td style="padding:8px 0;">Asset Intelligence page mapping OS and CVE risk indexes</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-safe); font-weight:600;">COMPLIANT</td>
              </tr>
              <tr>
                <td style="padding:8px 0; font-family:var(--font-mono); font-weight:600;">NIST PR.AC-1</td>
                <td style="padding:8px 0;">Access permissions are authorized and mapped to roles</td>
                <td style="padding:8px 0;">Role switches and permission switches toggled for SOC analysts</td>
                <td style="padding:8px 0; text-align:right; color:var(--status-safe); font-weight:600;">COMPLIANT</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
      showReport("Regulatory Compliance Audit", html);
    });
  }
}
