import { useState, useEffect } from 'react'

const UOF_A_GREEN = '#007C41'
const UOF_A_GOLD = '#FFDB05'

type AccessibilityMode = 'high-contrast' | 'color-blind' | 'dyslexia' | 'adhd'

function App() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('Ready')
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('adhd')

  useEffect(() => {
    // Define the type inline so TypeScript stops complaining
    chrome.storage.local.get(['canvasToken'], (result: { [key: string]: any }) => {
      if (result.canvasToken) {
        setToken(result.canvasToken);
      }
    });
  }, []);

  const saveToken = (value: string) => {
    setToken(value)
    chrome.storage.local.set({ canvasToken: value })
  }

  const scanForFiles = () => {
    setStatus('Scanning...')
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.id) return
      
      chrome.tabs.sendMessage(tab.id, { type: 'SCAN_FILES' }, (response) => {
        if (chrome.runtime.lastError) {
          setStatus('Error: Refresh the page')
        } else if (response?.files) {
          setFiles(response.files)
          setStatus(`Found ${response.files.length} files!`)
        }
      })
    })
  }

  return (
    <div style={{ padding: '20px', width: '320px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '12px', color: UOF_A_GREEN }}>Inclusive Canvas</h1>

      <input
        type="password"
        placeholder="Canvas API Token"
        value={token}
        onChange={(e) => saveToken(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', border: `2px solid ${UOF_A_GREEN}`, borderRadius: '4px' }}
      />

      <button onClick={scanForFiles} style={{ width: '100%', padding: '12px', background: UOF_A_GREEN, color: 'white', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
        🔍 Scan for Documents
      </button>

      {files.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <label style={{ fontSize: '12px', color: '#666' }}>PDF View Preference:</label>
          <select 
            value={accessibilityMode} 
            onChange={(e) => setAccessibilityMode(e.target.value as AccessibilityMode)}
            style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px' }}
          >
            <option value="adhd">ADHD (Warm/Low Glare)</option>
            <option value="high-contrast">High Contrast (Dark Mode)</option>
            <option value="color-blind">Color Blind Assist</option>
            <option value="dyslexia">Enhanced Spacing</option>
          </select>

          <ul style={{ listStyle: 'none', padding: 0 }}>
            {files.map((file, index) => (
              <li key={index} style={{ borderBottom: '1px solid #eee', padding: '8px 0' }}>
                <p style={{ fontSize: '13px', margin: '0 0 5px 0' }}>{file.name}</p>
                <button
                  onClick={() => {
                    const viewerUrl = chrome.runtime.getURL('pdf-viewer.html') +
                      `?url=${encodeURIComponent(file.url)}&mode=${accessibilityMode}`
                    chrome.tabs.create({ url: viewerUrl })
                  }}
                  style={{ background: UOF_A_GOLD, border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                  View Accessible PDF
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p style={{ fontSize: '11px', color: '#999', marginTop: '10px' }}>Status: {status}</p>
    </div>
  )
}

export default App