import { useState, useRef } from 'react'
import './ExportImport.css'

const ExportImport = () => {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleExport = async () => {
    setIsLoading(true)
    setError('')
    setMessage('')
    
    try {
      const response = await fetch('/api/export-import/export')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      // Utwórz blob i pobierz plik
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = 'gymprogress-backup.json'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      setMessage('Data exported successfully. File downloaded.')
    } catch (error) {
      console.error('Error exporting data:', error)
      setError(error.message || 'Failed to export data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (file) => {
    setIsLoading(true)
    setError('')
    setMessage('')
    
    try {
      const fileText = await readFileAsText(file)
      const importData = JSON.parse(fileText)
      
      const response = await fetch('/api/export-import/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(importData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setMessage(result.message)
      setError('')
      
      // Odśwież stronę po udanym imporcie
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error('Error importing data:', error)
      setError(error.message || 'Failed to import data')
      setMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      handleImport(file)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="export-import">
      <h3>Export / Import Data</h3>
      
      <div className="export-section">
        <h4>Export Data</h4>
        <button 
          onClick={handleExport} 
          className="export-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Exporting...' : 'Export All Data'}
        </button>
      </div>

      <div className="import-section">
        <h4>Import Data</h4>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".json"
          style={{ display: 'none' }}
        />
        
        <button 
          onClick={triggerFileInput} 
          className="import-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Importing...' : 'Import from File'}
        </button>
      </div>

      {message && <div className="message">{message}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  )
}

export default ExportImport