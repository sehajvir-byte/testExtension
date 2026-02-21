chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "SCAN_FILES") {
    // Find all links on the page
    const links = Array.from(document.querySelectorAll('a'));
    
    // Filter for files or PDFs
    const files = links
      .filter(link => link.href.includes('/files/') || link.href.toLowerCase().endsWith('.pdf'))
      .map(link => ({
        name: (link.textContent || link.innerText || 'Course File').trim(),
        url: link.href
      }));

    sendResponse({ files });
  }
  return true; 
});