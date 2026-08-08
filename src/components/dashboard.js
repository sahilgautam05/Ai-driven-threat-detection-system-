import { stateManager } from '../state.js';
import { showToast } from './utils.js';

export function initDashboard() {
  const statsWidgets = document.getElementById('statsWidgets');
  const healthCircleRing = document.getElementById('healthCircleRing');
  const healthScoreText = document.getElementById('healthScoreText');
  const distributionBarsContainer = document.getElementById('distributionBarsContainer');
  const timelineChartSvg = document.getElementById('timelineChartSvg');
  const timelineChartTooltip = document.getElementById('timelineChartTooltip');

  if (!statsWidgets || !healthCircleRing || !healthScoreText) return;

  // Render Stats & Charts on load
  renderDashboard();

  // Re-render when telemetry updates
  stateManager.subscribe('detectionsChanged', renderDashboard);
  stateManager.subscribe('incidentsChanged', renderDashboard);
  stateManager.subscribe('rulesChanged', renderDashboard);

  function renderDashboard() {
    const { detections, incidents, assets } = stateManager.state;

    // 1. Calculate Security Health Score
    // Starts at 100, reduced by active incidents risk
    const activeIncidents = incidents.filter(i => i.status === 'Active');
    let penalty = 0;
    activeIncidents.forEach(inc => {
      if (inc.severity === 'Critical') penalty += 12;
      else if (inc.severity === 'High') penalty += 6;
      else penalty += 3;
    });
    const healthScore = Math.max(10, 100 - penalty);
    healthScoreText.textContent = healthScore;

    // Animate circular ring: perimeter = 2 * PI * 50 = 314.16
    const perimeter = 314.16;
    const offset = perimeter - (perimeter * healthScore) / 100;
    healthCircleRing.style.strokeDashoffset = offset;
    
    // Color code health ring
    if (healthScore >= 80) {
      healthCircleRing.style.stroke = 'var(--accent-cyan)';
    } else if (healthScore >= 50) {
      healthCircleRing.style.stroke = 'var(--status-high)';
    } else {
      healthCircleRing.style.stroke = 'var(--status-critical)';
    }

    // 2. Aggregate statistics counters
    const criticalCount = detections.filter(d => d.severity === 'Critical' && d.status !== 'Resolved').length;
    const highCount = detections.filter(d => d.severity === 'High' && d.status !== 'Resolved').length;
    const mediumCount = detections.filter(d => d.severity === 'Medium' && d.status !== 'Resolved').length;
    const resolvedCount = incidents.filter(i => i.status === 'Resolved').length + detections.filter(d => d.status === 'Resolved').length;

    statsWidgets.innerHTML = `
      <div class="stat-item" id="stat-critical-widget">
        <div class="stat-top" style="color: var(--status-critical);">
          <span>Critical Alerts</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <div class="stat-value critical">${criticalCount}</div>
      </div>
      <div class="stat-item" id="stat-high-widget">
        <div class="stat-top" style="color: var(--status-high);">
          <span>High Alerts</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
        </div>
        <div class="stat-value high">${highCount}</div>
      </div>
      <div class="stat-item" id="stat-medium-widget">
        <div class="stat-top" style="color: var(--status-medium);">
          <span>Medium Risks</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 7 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 7 23 7 23 13"></polyline></svg>
        </div>
        <div class="stat-value medium">${mediumCount}</div>
      </div>
      <div class="stat-item" id="stat-resolved-widget">
        <div class="stat-top" style="color: var(--status-safe);">
          <span>Resolved Events</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="stat-value resolved">${resolvedCount}</div>
      </div>
      <div class="stat-item" id="stat-assets-widget">
        <div class="stat-top">
          <span>Assets Monitored</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect></svg>
        </div>
        <div class="stat-value normal">${assets.length}</div>
      </div>
      <div class="stat-item" id="stat-analyzed-widget" style="cursor:default;">
        <div class="stat-top">
          <span>Events Analyzed</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="stat-value normal">1,482</div>
      </div>
    `;

    // Add Widget Click Handlers (Cross filtering & View navigation)
    document.getElementById('stat-critical-widget').addEventListener('click', () => {
      stateManager.setFilter('severity', 'Critical');
      stateManager.setView('detections');
    });
    document.getElementById('stat-high-widget').addEventListener('click', () => {
      stateManager.setFilter('severity', 'High');
      stateManager.setView('detections');
    });
    document.getElementById('stat-medium-widget').addEventListener('click', () => {
      stateManager.setFilter('severity', 'Medium');
      stateManager.setView('detections');
    });
    document.getElementById('stat-resolved-widget').addEventListener('click', () => {
      // Just filter table by active to show resolved
      stateManager.setFilter('severity', 'All');
      stateManager.setView('detections');
    });
    document.getElementById('stat-assets-widget').addEventListener('click', () => {
      stateManager.setView('assets');
    });

    // 3. Render Threat Category Distribution Bar Charts
    const categories = [
      'Credential abuse',
      'Phishing',
      'Suspicious login',
      'Anomalous network activity',
      'Data exfiltration indicators',
      'Privilege escalation indicators',
      'Endpoint anomalies'
    ];

    distributionBarsContainer.innerHTML = '';
    
    // Count occurrences of each category
    const catCounts = {};
    categories.forEach(cat => {
      catCounts[cat] = detections.filter(d => d.category === cat).length;
    });
    
    const maxCount = Math.max(...Object.values(catCounts), 1);

    categories.forEach(cat => {
      const count = catCounts[cat];
      const pct = (count / maxCount) * 100;
      
      const barItem = document.createElement('div');
      barItem.className = 'bar-item';
      
      // Determine bar color by whether category contains active critical detections
      const hasCritical = detections.some(d => d.category === cat && d.severity === 'Critical' && d.status !== 'Resolved');
      const hasHigh = detections.some(d => d.category === cat && d.severity === 'High' && d.status !== 'Resolved');
      let fillClass = '';
      if (hasCritical) fillClass = 'critical';
      else if (hasHigh) fillClass = 'warning';

      barItem.innerHTML = `
        <div class="bar-info">
          <span>${cat}</span>
          <span style="font-family:var(--font-mono); font-weight:600;">${count}</span>
        </div>
        <div class="bar-bg">
          <div class="bar-fill ${fillClass}" style="width: ${pct}%"></div>
        </div>
      `;

      // Filter Detections Table by Category when clicking Bar
      barItem.addEventListener('click', () => {
        stateManager.setFilter('category', cat);
        stateManager.setView('detections');
        showToast(`Filtered workbench by category: ${cat}`, 'success');
      });

      distributionBarsContainer.appendChild(barItem);
    });

    // 4. Render Interactive SVG Timeline
    drawTimelineChart(detections);
  }

  function drawTimelineChart(detections) {
    if (!timelineChartSvg) return;
    timelineChartSvg.innerHTML = '';

    const width = timelineChartSvg.clientWidth || 600;
    const height = timelineChartSvg.clientHeight || 220;
    const paddingLeft = 50;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Draw grid background line axes
    const gridYLines = 4;
    for (let i = 0; i <= gridYLines; i++) {
      const y = paddingTop + (chartHeight / gridYLines) * i;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', paddingLeft);
      line.setAttribute('y1', y);
      line.setAttribute('x2', width - paddingRight);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.04)');
      line.setAttribute('stroke-width', '1');
      timelineChartSvg.appendChild(line);
      
      // Label severity on Y-axis
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', paddingLeft - 10);
      label.setAttribute('y', y + 4);
      label.setAttribute('fill', 'var(--text-secondary)');
      label.setAttribute('font-size', '10px');
      label.setAttribute('text-anchor', 'end');
      
      if (i === 0) label.textContent = 'Critical';
      else if (i === 1) label.textContent = 'High';
      else if (i === 2) label.textContent = 'Medium';
      else if (i === 3) label.textContent = 'Low';
      else label.textContent = 'Info';
      
      timelineChartSvg.appendChild(label);
    }

    // Sort detections chronologically to plot points
    const sorted = [...detections].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    if (sorted.length === 0) return;

    const startTime = new Date(sorted[0].timestamp).getTime();
    const endTime = new Date(sorted[sorted.length - 1].timestamp).getTime();
    const timeSpan = Math.max(1, endTime - startTime);

    // Render connection line through points
    let pointsPath = '';
    const severityYMapping = {
      'Critical': paddingTop,
      'High': paddingTop + (chartHeight / 4) * 1,
      'Medium': paddingTop + (chartHeight / 4) * 2,
      'Low': paddingTop + (chartHeight / 4) * 3,
      'Informational': paddingTop + chartHeight
    };

    const plottedCoordinates = sorted.map((det, index) => {
      const timeOffset = new Date(det.timestamp).getTime() - startTime;
      const x = paddingLeft + (timeOffset / timeSpan) * chartWidth;
      const y = severityYMapping[det.severity] || (paddingTop + chartHeight);
      return { x, y, det };
    });

    // Draw smooth line
    if (plottedCoordinates.length > 1) {
      pointsPath = `M ${plottedCoordinates[0].x} ${plottedCoordinates[0].y} `;
      for (let i = 1; i < plottedCoordinates.length; i++) {
        pointsPath += `L ${plottedCoordinates[i].x} ${plottedCoordinates[i].y} `;
      }

      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', pointsPath);
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('stroke', 'rgba(0, 240, 255, 0.15)');
      pathElement.setAttribute('stroke-width', '2');
      timelineChartSvg.appendChild(pathElement);
    }

    // Draw glowing data dots
    plottedCoordinates.forEach(({ x, y, det }) => {
      // Glow filter block or double circles
      const circleOuter = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circleOuter.setAttribute('cx', x);
      circleOuter.setAttribute('cy', y);
      circleOuter.setAttribute('r', '8');
      circleOuter.setAttribute('fill', 'transparent');
      
      let dotColor = 'var(--status-low)';
      if (det.severity === 'Critical') dotColor = 'var(--status-critical)';
      else if (det.severity === 'High') dotColor = 'var(--status-high)';
      else if (det.severity === 'Medium') dotColor = 'var(--status-medium)';

      circleOuter.setAttribute('stroke', dotColor);
      circleOuter.setAttribute('stroke-width', '1');
      circleOuter.setAttribute('opacity', '0.4');
      timelineChartSvg.appendChild(circleOuter);

      const circleInner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circleInner.setAttribute('cx', x);
      circleInner.setAttribute('cy', y);
      circleInner.setAttribute('r', '4');
      circleInner.setAttribute('fill', dotColor);
      circleInner.style.cursor = 'pointer';
      circleInner.style.transition = 'transform 0.1s';
      
      // Interactive Tooltip Events
      circleInner.addEventListener('mouseenter', (e) => {
        circleInner.setAttribute('r', '6');
        timelineChartTooltip.style.opacity = '1';
        timelineChartTooltip.style.left = `${x + 10}px`;
        timelineChartTooltip.style.top = `${y - 40}px`;
        
        const timeFormatted = new Date(det.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timelineChartTooltip.innerHTML = `
          <strong style="color: ${dotColor};">${det.severity} Alert</strong><br/>
          <strong>ID:</strong> ${det.id}<br/>
          <strong>Type:</strong> ${det.category}<br/>
          <strong>Asset:</strong> ${det.asset}<br/>
          <strong>Score:</strong> ${det.riskScore}/100<br/>
          <span style="font-size:0.7rem; color:var(--text-secondary);">${timeFormatted}</span>
        `;
      });

      circleInner.addEventListener('mouseleave', () => {
        circleInner.setAttribute('r', '4');
        timelineChartTooltip.style.opacity = '0';
      });

      // Clicking timeline dot opens detail drawer
      circleInner.addEventListener('click', () => {
        stateManager.setSelectedIncident(det.incidentId);
        // Show drawer immediately
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

      timelineChartSvg.appendChild(circleInner);
    });

    // Horizontal bottom axis time labels
    const timeLabelsCount = 3;
    for (let i = 0; i < timeLabelsCount; i++) {
      const pct = i / (timeLabelsCount - 1);
      const x = paddingLeft + pct * chartWidth;
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', height - 10);
      label.setAttribute('fill', 'var(--text-muted)');
      label.setAttribute('font-size', '10px');
      label.setAttribute('text-anchor', 'middle');

      const timeVal = new Date(startTime + pct * timeSpan);
      label.textContent = timeVal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      timelineChartSvg.appendChild(label);
    }
  }
}
