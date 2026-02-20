// Listen for messages from the React Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "FETCH_CANVAS_DATA") {
      const { courseId, token } = request.payload;
  
      // Talking to the University of Alberta Canvas API
      fetch(`https://uofa.instructure.com/api/v1/courses/${courseId}/syllabus`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        // Send the data back to the Popup or Content Script
        sendResponse({ success: true, data: data.public_syllabus_body || data.body });
      })
      .catch(err => sendResponse({ success: false, error: err.message }));
  
      return true; // Keep the channel open for the async fetch
    }
  });