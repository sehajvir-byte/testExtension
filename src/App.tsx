import { useState, useEffect } from 'react'

const UOF_A_GREEN = '#007C41'
const UOF_A_GOLD = '#FFDB05'

type AccessibilityMode = 'high-contrast' | 'color-blind' | 'dyslexia' | 'adhd'
type SortOption = 'none' | 'a-z' | 'z-a'

const MODE_LABELS: Record<AccessibilityMode, string> = {
  'high-contrast': 'High contrast',
  'color-blind': 'Color blind',
  dyslexia: 'Dyslexia',
  adhd: 'ADHD'
}

type ClickedLink = { name: string; url: string; clickedAt: string }

function App() {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('Ready')
  const [files, setFiles] = useState<{ name: string; url: string }[]>([])
  const [clickedLinks, setClickedLinks] = useState<ClickedLink[]>([])
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('adhd')
  const [sortOption, setSortOption] = useState<SortOption>('none')

  useEffect(() => {
    chrome.storage.local.get(['canvasToken', 'clickedLinks'], (result: { canvasToken?: string; clickedLinks?: ClickedLink[] }) => {
      if (typeof result.canvasToken === 'string') setToken(result.canvasToken)
      if (Array.isArray(result.clickedLinks)) setClickedLinks(result.clickedLinks)
    })
  }, [])

  const saveClickedLink = (file: { name: string; url: string }) => {
    const entry: ClickedLink = { ...file, clickedAt: new Date().toISOString() }
    const updated = [...clickedLinks, entry]
    setClickedLinks(updated)
    chrome.storage.local.set({ clickedLinks: updated })
  }

  const exportToJsonFile = () => {
    const json = JSON.stringify(clickedLinks, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inclusive-canvas-clicked-links-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Exported!')
  }

  const saveToken = (value: string) => {
    setToken(value)
    chrome.storage.local.set({ canvasToken: value })
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (sortOption === 'a-z') return a.name.localeCompare(b.name)
    if (sortOption === 'z-a') return b.name.localeCompare(a.name)
    return 0
  })

  const sendToContentScript = (
    tabId: number,
    type: string,
    onSuccess: (response?: { files?: { name: string; url: string }[]; success?: boolean }) => void,
    payload?: Record<string, unknown>,
    retryAfterInject = true
  ) => {
    chrome.tabs.sendMessage(tabId, { type, ...(payload ?? {}) }, (response) => {
      if (chrome.runtime.lastError) {
        const err = chrome.runtime.lastError.message || ''
        if (retryAfterInject && err.includes('Receiving end does not exist')) {
          const manifest = chrome.runtime.getManifest()
          const scriptPath = manifest.content_scripts?.[0]?.js?.[0]
          if (scriptPath) {
            chrome.scripting.executeScript({ target: { tabId }, files: [scriptPath] }, () => {
              if (chrome.runtime.lastError) {
                setStatus('Refresh the Canvas page and try again')
                return
              }
              sendToContentScript(tabId, type, onSuccess, payload, false)
            })
            return
          }
        }
        setStatus(err.includes('Receiving end') ? 'Refresh the Canvas page and try again' : 'Error: ' + err)
        return
      }
      onSuccess(response)
    })
  }

  const scanForFiles = () => {
    setStatus('Scanning...')
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.id) {
        setStatus('Error: No active tab found')
        return
      }
      const url = tab.url || ''
      const isCanvasPage = url.includes('instructure.com') || url.includes('canvas.ualberta.ca')
      if (!isCanvasPage) {
        setStatus('Open a Canvas page first')
        return
      }
      sendToContentScript(tab.id, 'SCAN_FILES', (response) => {
        if (response?.files) {
          setFiles(response.files)
          setStatus(`Found ${response.files.length} files!`)
        } else {
          setStatus('No files found')
        }
      })
    })
  }

  const optimizePage = () => {
    setStatus('Optimizing...')
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0]
      if (!tab?.id) {
        setStatus('Error: No active tab found')
        return
      }
      const url = tab.url || ''
      const isCanvasPage = url.includes('instructure.com') || url.includes('canvas.ualberta.ca')
      if (!isCanvasPage) {
        setStatus('Open a Canvas page first')
        return
      }
      sendToContentScript(tab.id, 'APPLY_ACCESSIBILITY_MODE', () => {
        setStatus('Page optimized!')
      }, { mode: accessibilityMode })
    })
  }

  return (
    <div style={{ padding: '20px', width: '320px' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '12px', color: UOF_A_GREEN }}>Inclusive Canvas</h1>

      <input
        type="password"
        placeholder="Canvas API Token"
        value={token}
        onChange={(e) => saveToken(e.target.value)}
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '10px',
          border: `2px solid ${UOF_A_GREEN}`,
          borderRadius: '4px',
          boxSizing: 'border-box'
        }}
      />

      <button
        onClick={scanForFiles}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 600,
          background: UOF_A_GREEN,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔍 Scan
      </button>

      {files.length > 0 && (
        <>
          <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '12px', color: '#555' }}>Sort:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              style={{
                flex: 1,
                padding: '6px',
                fontSize: '12px',
                border: `1px solid ${UOF_A_GREEN}`,
                borderRadius: '4px'
              }}
            >
              <option value="none">Default</option>
              <option value="a-z">A → Z</option>
              <option value="z-a">Z → A</option>
            </select>
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0' }}>
            {sortedFiles.map((file, index) => (
              <li key={index} style={{ borderBottom: '1px solid #e0e0e0', padding: '10px 0' }}>
                <p style={{ fontSize: '13px', margin: '0 0 6px 0', wordBreak: 'break-word' }}>{file.name}</p>
                <button
                  onClick={() => {
                    saveClickedLink(file)
                    window.open(file.url, '_blank')
                  }}
                  style={{
                    fontSize: '12px',
                    background: UOF_A_GOLD,
                    color: '#333',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Open
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>
          Page mode:
        </label>
        <select
          value={accessibilityMode}
          onChange={(e) => setAccessibilityMode(e.target.value as AccessibilityMode)}
          style={{
            width: '100%',
            padding: '8px',
            fontSize: '13px',
            border: `2px solid ${UOF_A_GREEN}`,
            borderRadius: '4px',
            boxSizing: 'border-box'
          }}
        >
          {(Object.keys(MODE_LABELS) as AccessibilityMode[]).map((m) => (
            <option key={m} value={m}>
              {MODE_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={optimizePage}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '10px',
          fontSize: '14px',
          fontWeight: 600,
          background: UOF_A_GREEN,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Optimize Page
      </button>

      {clickedLinks.length > 0 && (
        <button
          onClick={exportToJsonFile}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            fontSize: '12px',
            background: UOF_A_GOLD,
            color: '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Export clicked links (JSON)
        </button>
      )}

      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Status: {status}</p>
    </div>
  )
}

export default App
