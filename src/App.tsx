import { useState, useEffect } from 'react'
import { processSelectedFile } from "./background";
import './App.css'
import logo from '../icons/canvas-accessify-icon.png'

function App() {
  const [accessibilityModes, setAccessibilityModes] = useState({
  adhd: false,
  dyslexia: false,
  colorBlind: false,
  highContrast: false
})
  const [token, setToken] = useState('')
  const [googleToken, setGoogleToken] = useState('')
  const [loadingFile, setLoadingFile] = useState<string | null>(null)
  const [status, setStatus] = useState('Ready')
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
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
  }, [files])

  // Load tokens on startup
 useEffect(() => {
  chrome.storage.local.get(
    ['canvasToken', 'googleToken'],
    (result: { canvasToken?: string; googleToken?: string }) => {

      if (typeof result.canvasToken === 'string') {
        setToken(result.canvasToken)
      }

      if (typeof result.googleToken === 'string') {
        setGoogleToken(result.googleToken)
      }

      if (!result.canvasToken || !result.googleToken) {
        setShowSettings(true)
      } else {
        setShowSettings(false)
      }
    }
  )
}, [])


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

        {/* Canvas API Token */}
        <label className="token-label">Canvas API Token</label>
        <input
          type="password"
          placeholder="Canvas API Token"
          value={token}
          onChange={(e) => {
            const value = e.target.value
            setToken(value)
            chrome.storage.local.set({ canvasToken: value })
          }}
          className="token-input"
        />

        {/* Google API Token */}
        <label className="token-label">Google API Token</label>
        <input
          type="password"
          placeholder="Google API Token"
          value={googleToken}
          onChange={(e) => {
            const value = e.target.value
            setGoogleToken(value)
            chrome.storage.local.set({ googleToken: value })
          }}
          className="token-input"
        />

        {(token || googleToken) && (
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
          Edit Tokens
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

          <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '8px' }}>
            PDF View Preference:
          </label>

          {/* ===== ACCESSIBILITY MODE BUTTON GRID ===== */}
          <div className="mode-grid">

            <button
              className={`mode-btn ${accessibilityModes.adhd ? 'active' : ''}`}
              onClick={() =>
                setAccessibilityModes(prev => ({ ...prev, adhd: !prev.adhd }))
              }
            >
              ADHD
            </button>

            <button
              className={`mode-btn ${accessibilityModes.dyslexia ? 'active' : ''}`}
              onClick={() =>
                setAccessibilityModes(prev => ({ ...prev, dyslexia: !prev.dyslexia }))
              }
            >
              Dyslexia
            </button>

            <button
              className={`mode-btn ${accessibilityModes.colorBlind ? 'active' : ''}`}
              onClick={() =>
                setAccessibilityModes(prev => ({ ...prev, colorBlind: !prev.colorBlind }))
              }
            >
              Color Blind
            </button>

            <button
              className={`mode-btn ${accessibilityModes.highContrast ? 'active' : ''}`}
              onClick={() =>
                setAccessibilityModes(prev => ({ ...prev, highContrast: !prev.highContrast }))
              }
            >
              High Contrast
            </button>

          </div>

          {/* ===== FILE LIST ===== */}
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-name">{file.name}</div>

              <button
                onClick={() => {
                  setLoadingFile(file.name)
                  processSelectedFile(file, accessibilityModes)
                }}
                className="gold-button"
                disabled={loadingFile === file.name}
              >
                {loadingFile === file.name ? "Loading..." : "View Accessible PDF"}
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