/**
 * Sentinel AI UI Utilities & Helpers
 */

export function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type === 'Critical' || type === 'critical' ? 'critical' : ''} ${type === 'success' ? 'success' : ''}`;
  
  // Choose icon based on type
  let icon = `
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  `;
  if (type === 'Critical' || type === 'critical') {
    icon = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
    `;
  } else if (type === 'success') {
    icon = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;
  }

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto-remove toast
  setTimeout(() => {
    toast.style.animation = 'slide-in-toast 0.2s cubic-bezier(0.4, 0, 0.2, 1) reverse';
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}

export function exportToCSV(headers, data, filename = 'sentinel_export.csv') {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  csvContent += headers.join(",") + "\n";
  
  // Add data rows
  data.forEach(row => {
    const formattedRow = row.map(val => {
      if (val === null || val === undefined) return '""';
      let str = String(val).replace(/"/g, '""'); // escape double quotes
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        str = `"${str}"`;
      }
      return str;
    });
    csvContent += formattedRow.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast(`Successfully exported ${data.length} items to CSV.`, 'success');
}

export function renderSkeletons(container, count = 3, height = '40px') {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.style.height = height;
    skeleton.style.width = '100%';
    skeleton.style.background = 'linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.02) 75%)';
    skeleton.style.backgroundSize = '200% 100%';
    skeleton.style.borderRadius = '6px';
    skeleton.style.marginBottom = '10px';
    skeleton.style.animation = 'shimmer 1.5s infinite';
    container.appendChild(skeleton);
  }
}

// Add CSS keyframe for shimmer if not defined
if (!document.getElementById('shimmer-style-tag')) {
  const style = document.createElement('style');
  style.id = 'shimmer-style-tag';
  style.innerHTML = `
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export function formatTime(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch (e) {
    return isoString;
  }
}

export function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return isoString;
  }
}
