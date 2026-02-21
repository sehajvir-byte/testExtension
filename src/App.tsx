import { useState, useEffect } from 'react'
import { processSelectedFile } from "./background";
import './App.css'
import logo from '../icons/canvas-accessify-icon.png'

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

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.url.startsWith('blob:')) URL.revokeObjectURL(f.url)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
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
    <div className="app-container">

      {/* ===== HEADER ===== */}
      <div className="header">
        <img src={logo} className="app-logo" />
        <h1 className="app-title">Canvas Accessify</h1>
        <div className="gold-line" />
      </div>

      {/* ===== TOKEN SECTION ===== */}
      {showSettings ? (
        <div className="section">
          <input
            type="password"
            placeholder="Canvas API Token"
            value={token}
            onChange={(e) => saveToken(e.target.value)}
            className="token-input"
          />

          {token && (
            <button
              onClick={() => setShowSettings(false)}
              className="link-button"
            >
              Save and Hide
            </button>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button
            onClick={() => setShowSettings(true)}
            className="link-button"
          >
            Edit Token
          </button>
        </div>
      )}

      {/* ===== SCAN BUTTON ===== */}
      <button
        onClick={scanForFiles}
        className="primary-button"
      >
        Scan for Documents
      </button>

      {/* ===== FILE LIST ===== */}
      {files.length > 0 && (
        <div className="section">

          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px' }}>
            PDF View Preference:
          </label>

          <select
            value={accessibilityMode}
            onChange={(e) => setAccessibilityMode(e.target.value as AccessibilityMode)}
            className="select-dropdown"
          >
            <option value="adhd">ADHD (Warm/Low Glare)</option>
            <option value="high-contrast">High Contrast (Dark Mode)</option>
            <option value="color-blind">Color Blind Assist</option>
            <option value="dyslexia">Enhanced Spacing</option>
          </select>

          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-name">{file.name}</div>
              <button
                onClick={() => processSelectedFile(file, accessibilityMode)}
                className="gold-button"
              >
                View Accessible PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ===== LOCAL FILE UPLOAD ===== */}
      <div className="section">
        <label htmlFor="local-pdf-input" className="custom-file-label">
          Choose PDF File
        </label>

        <input
          id="local-pdf-input"
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            addLocalFile(file)
            e.currentTarget.value = ''
            setStatus(`Loaded local file: ${file.name}`)
          }}
        />

        <p style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
          Local PDFs are opened via a blob URL and will appear in the file list above.
        </p>
      </div>

      {/* ===== STATUS ===== */}
      <p className="status-text">
        Status: {status}
      </p>

    </div>
  )
}

export default App