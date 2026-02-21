// Background service worker - handles API requests. Does NOT block Popup <-> Content Script messaging.
// Popup uses chrome.tabs.sendMessage to talk directly to content script; those bypass the background.
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "FETCH_CANVAS_DATA") {
    (async () => {
      try {
        const { courseId, token } = request.payload;
        console.log("Fetching Canvas data for course:", courseId);
        const url = `https://uofa.instructure.com/api/v1/courses/${courseId}/syllabus`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          console.error("Canvas API Error Status:", response.status);
          const errorText = await response.text();
          console.error("Canvas responded with HTML/Text instead of JSON:", errorText.substring(0, 100));
          sendResponse({ success: false, error: `Canvas error: ${response.status}` });
          return;
        }

        const data = await response.json();
        sendResponse({ success: true, data: data.public_syllabus_body || data.body });
      } catch (err) {
        sendResponse({ success: false, error: (err as Error).message });
      }
    })();
    return true; // Keep the channel open for the async fetch
  }
});