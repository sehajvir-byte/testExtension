chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "SCAN_FILES") {
    const links = Array.from(document.querySelectorAll('a'));

    const unique = new Map<string, { name: string; url: string }>();

    links.forEach(link => {
      const href = link.href;

      // Only match REAL Canvas file links: /files/<number>
      const fileMatch = href.match(/\/files\/(\d+)/);
      if (!fileMatch) return;

      const fileId = fileMatch[1];

      // Prefer the download link if available
      const isDownload = href.includes("/download");

      const name =
        (link.textContent || link.innerText || "Course File").trim() ||
        "Course File";

      // If we already have an entry for this fileId, only replace if this one is a download link
      if (unique.has(fileId)) {
        if (isDownload) {
          unique.set(fileId, { name, url: href });
        }
      } else {
        unique.set(fileId, { name, url: href });
      }
    });

    sendResponse({ files: [...unique.values()] });
    return true;
  }
}); 