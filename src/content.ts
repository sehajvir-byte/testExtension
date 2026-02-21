type AccessibilityMode = 'high-contrast' | 'color-blind' | 'dyslexia' | 'adhd'

function applyAccessibilityStyles(mode: AccessibilityMode) {
  const leftSide = document.querySelector('#left-side');
  if (leftSide) {
    (leftSide as HTMLElement).style.display = 'none';
  }

  const main = document.querySelector('#main');
  if (main) {
    const el = main as HTMLElement;
    el.style.maxWidth = '800px';
    el.style.margin = '0 auto';
  }

  const root = document.documentElement;
  const body = document.body;

  // Reset any previous mode
  root.removeAttribute('data-inclusive-mode');
  body.style.cssText = '';

  root.setAttribute('data-inclusive-mode', mode);

  switch (mode) {
    case 'high-contrast': {
      body.style.background = '#000';
      body.style.color = '#fff';
      const allText = document.querySelectorAll('p, span, a, h1, h2, h3, h4, li, td, th, div');
      allText.forEach(el => {
        const html = el as HTMLElement;
        html.style.color = '#fff';
        html.style.background = 'transparent';
      });
      document.querySelectorAll('a').forEach(a => {
        (a as HTMLElement).style.color = '#00bfff';
        (a as HTMLElement).style.textDecoration = 'underline';
      });
      document.querySelectorAll('p, div').forEach(p => {
        const html = p as HTMLElement;
        html.style.lineHeight = '1.6';
      });
      break;
    }

    case 'color-blind': {
      // Deuteranopia/protanopia-friendly: avoid red-green, use blue/orange/yellow
      body.style.background = '#fff';
      body.style.color = '#1a1a1a';
      document.querySelectorAll('a').forEach(a => {
        const html = a as HTMLElement;
        html.style.color = '#0066cc';
        html.style.fontWeight = '600';
        html.style.textDecoration = 'underline';
      });
      document.querySelectorAll('p, div, span, li').forEach(el => {
        const html = el as HTMLElement;
        html.style.lineHeight = '1.7';
        html.style.letterSpacing = '0.02em';
      });
      break;
    }

    case 'dyslexia': {
      // High readability: spacing, line-height, avoid cramped text
      body.style.fontFamily = 'Arial, Helvetica, sans-serif';
      body.style.letterSpacing = '0.05em';
      body.style.wordSpacing = '0.1em';
      document.querySelectorAll('p, div, span, li, td, th').forEach(el => {
        const html = el as HTMLElement;
        html.style.lineHeight = '1.8';
        html.style.fontSize = '1.05em';
        html.style.letterSpacing = '0.05em';
        html.style.fontStyle = 'normal';
      });
      document.querySelectorAll('em, i').forEach(el => {
        (el as HTMLElement).style.fontStyle = 'normal';
        (el as HTMLElement).style.fontWeight = '600';
      });
      break;
    }

    case 'adhd':
    default: {
      document.querySelectorAll('p, div, span, li').forEach(el => {
        (el as HTMLElement).style.lineHeight = '1.6';
      });
      break;
    }
  }
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "SCAN_FILES") {
    const links = Array.from(document.querySelectorAll('a'));
    const files = links
      .filter(link => link.href.includes('/files/') || link.href.endsWith('.pdf'))
      .map(link => ({
        name: (link.textContent || link.innerText || 'Course File').trim() || 'Course File',
        url: link.href
      }));
    sendResponse({ files });
    return true;
  }

  if (request.type === "APPLY_ACCESSIBILITY_MODE") {
    const mode = (request.mode || 'adhd') as AccessibilityMode;
    applyAccessibilityStyles(mode);
    sendResponse({ success: true });
    return false;
  }
});
