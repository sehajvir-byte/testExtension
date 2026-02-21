import { useState, useEffect } from 'react'
import { processSelectedFile } from "./background";

const UOF_A_GREEN = '#007C41'
const UOF_A_GOLD = '#FFDB05'

type AccessibilityMode = 'high-contrast' | 'color-blind' | 'dyslexia' | 'adhd'

function App() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('Ready')
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('adhd')
  const [showSettings, setShowSettings] = useState(false)

 const addLocalFile = (file: File) => {
  const url = URL.createObjectURL(file)
  const name = file.name || 'Local PDF'
  setFiles(prev => [{ name, url }, ...prev])
}

// cleanup blob URLs on unmount or when files change
useEffect(() => {
  return () => {
    files.forEach(f => {
      if (f.url.startsWith('blob:')) URL.revokeObjectURL(f.url)
    })
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  useEffect(() => {
    // result type is defined here to fix the TypeScript error
    chrome.storage.local.get(['canvasToken'], (result: { [key: string]: any }) => {
      if (result.canvasToken) {
        setToken(result.canvasToken)
        setShowSettings(false)
      } else {
        setShowSettings(true)
      }
    })
  }, [])

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
          setStatus('Error: Refresh the Canvas page')
        } else if (response?.files) {
          setFiles(response.files)
          setStatus(`Found ${response.files.length} files!`)
        } else {
          setStatus('No files found on this page.')
        }
      })
    })
  }

  return (
    <div style={{ padding: '20px', width: '320px', fontFamily: 'sans-serif', backgroundColor: '#fff' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '12px', color: UOF_A_GREEN }}>Inclusive Canvas</h1>

      {/* Conditional Rendering: Hides the input box if a token exists */}
      {showSettings ? (
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
            placeholder="Canvas API Token"
            value={token}
            onChange={(e) => saveToken(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: `2px solid ${UOF_A_GREEN}`, 
              borderRadius: '4px',
              boxSizing: 'border-box'
            }}
          />
          {token && (
            <button 
              onClick={() => setShowSettings(false)}
              style={{ fontSize: '11px', marginTop: '5px', background: 'none', border: 'none', cursor: 'pointer', color: '#666', textDecoration: 'underline' }}
            >
              Save and Hide
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            onClick={() => setShowSettings(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#666' }}
          >
            ⚙️ Edit Token
          </button>
        </div>
      )}

      <button 
        onClick={scanForFiles} 
        style={{ 
          width: '100%', 
          padding: '12px', 
          background: UOF_A_GREEN, 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          fontWeight: 600, 
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        🔍 Scan for Documents
      </button>

      {files.length > 0 && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
            PDF View Preference:
          </label>
          <select 
            value={accessibilityMode} 
            onChange={(e) => setAccessibilityMode(e.target.value as AccessibilityMode)}
            style={{ 
              width: '100%', 
              padding: '8px', 
              marginBottom: '15px', 
              borderRadius: '4px',
              border: `1px solid #ccc`
            }}
          >
            <option value="adhd">ADHD (Warm/Low Glare)</option>
            <option value="high-contrast">High Contrast (Dark Mode)</option>
            <option value="color-blind">Color Blind Assist</option>
            <option value="dyslexia">Enhanced Spacing</option>
          </select>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {files.map((file, index) => (
              <li key={index} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
                <p style={{ fontSize: '13px', margin: '0 0 8px 0', fontWeight: 500, color: '#333' }}>{file.name}</p>
                <button
                  onClick={() => {
                    // const viewerUrl = chrome.runtime.getURL('pdf-viewer.html') +
                    //   `?url=${encodeURIComponent(file.url)}&mode=${accessibilityMode}`
                    // chrome.tabs.create({ url: viewerUrl })
                    processSelectedFile(file,accessibilityMode)
                  }}
                  style={{ 
                    background: UOF_A_GOLD, 
                    border: 'none', 
                    padding: '6px 12px', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  View Accessible PDF
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
     
      {/* Local PDF input for testing */}
        <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>
            Load a local PDF for testing:
          </label>

          <input
            id="local-pdf-input"
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              addLocalFile(file)
              // clear the input so the same file can be re-selected if needed
              e.currentTarget.value = ''
              setStatus(`Loaded local file: ${file.name}`)
            }}
            style={{ width: '100%', marginBottom: '8px' }}
          />

          <p style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
            Local PDFs are opened via a blob URL and will appear in the file list above.
          </p>
        </div>

      <p style={{ fontSize: '11px', color: '#999', marginTop: '15px', textAlign: 'center' }}>
        Status: {status}
      </p>
    </div>
  )
}

export default App