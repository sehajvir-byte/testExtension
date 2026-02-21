// src/pdf-viewer.ts

document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(location.search);
  const pdfUrl = params.get('url');
  const mode = params.get('mode') || 'adhd';

  // 【关键修改】：使用 as 关键字进行类型断言
  const frame = document.getElementById('pdfFrame') as HTMLIFrameElement | null;
  const modeSelect = document.getElementById('mode') as HTMLSelectElement | null;
  const viewer = document.getElementById('viewer') as HTMLElement | null;
  const errorDiv = document.getElementById('error') as HTMLElement | null;
  const openRaw = document.getElementById('openRaw') as HTMLAnchorElement | null;

  if (!pdfUrl) {
    if (errorDiv) {
      errorDiv.textContent = 'No PDF URL provided.';
      errorDiv.style.display = 'block';
    }
    if (frame) frame.style.display = 'none';
    return;
  }

  // 现在 TypeScript 知道 openRaw 是 <a> 标签，允许使用 href
  if (openRaw) openRaw.href = pdfUrl;

  if (frame) {
    // 现在 TypeScript 知道 frame 是 <iframe> 标签，允许使用 src
    frame.src = pdfUrl;
    
    frame.addEventListener('error', function() {
      if (errorDiv) {
        errorDiv.textContent = 'Could not load PDF. Make sure you are logged into Canvas. ';
        
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.target = '_blank';
        link.textContent = 'Open in new tab';
        
        errorDiv.appendChild(link);
        errorDiv.style.display = 'block';
      }
      frame.style.display = 'none';
    });
  }

  if (modeSelect) {
    // 现在 TypeScript 知道 modeSelect 是 <select> 标签，允许使用 value
    modeSelect.value = mode;
    
    modeSelect.addEventListener('change', function() {
      if (viewer) viewer.className = 'viewer ' + modeSelect.value;
    });
  }

  if (viewer) viewer.className = 'viewer ' + mode;
});