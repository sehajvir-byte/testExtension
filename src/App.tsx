import { useState } from 'react';

function App() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState('Ready');

  const handleFetch = () => {
    setStatus('Fetching...');
    
    // Send message to background.ts
    chrome.runtime.sendMessage({
      type: "FETCH_CANVAS_DATA",
      payload: { courseId: "YOUR_COURSE_ID", token: token } // You can get courseId from URL later
    }, (response) => {
      if (response.success) {
        setStatus('Data Received! Modifying Page...');
        // Now tell the Content Script to inject this data
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "INJECT_ACCESSIBILITY",
            data: response.data
          });
        });
      } else {
        setStatus('Error: ' + response.error);
      }
    });
  };

  return (
    <div style={{ padding: '20px', width: '300px' }}>
      <h1>Inclusive Canvas</h1>
      <input 
        type="password" 
        placeholder="Enter Canvas Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button onClick={handleFetch} style={{ width: '100%', padding: '10px' }}>
        Optimize Syllabus
      </button>
      <p>Status: {status}</p>
    </div>
  );
}

export default App;
