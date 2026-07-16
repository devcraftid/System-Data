import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

// Univer CSS
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'

// Univer Plugins
import { Univer, UniverInstanceType, LocaleType } from '@univerjs/core'
import { defaultTheme } from '@univerjs/design'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import { UniverUIPlugin } from '@univerjs/ui'
import { FUniver } from '@univerjs/facade'

export default function SpreadsheetEditor() {
  const { spreadsheetId } = useParams()
  const navigate = useNavigate()
  
  const [sheetName, setSheetName] = useState('Loading...')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const univerRef = useRef<Univer | null>(null)
  const univerAPIRef = useRef<FUniver | null>(null)

  useEffect(() => {
    fetchMetadata()
  }, [spreadsheetId])

  const fetchMetadata = async () => {
    try {
      const { data, error } = await supabase
        .from('spreadsheets')
        .select('name, data')
        .eq('id', spreadsheetId)
        .single()
      
      if (error) throw error
      setSheetName(data.name)
      
      initUniver(data.data)
    } catch (e) {
      console.error(e)
      setSheetName('Unknown Spreadsheet')
    } finally {
      setLoading(false)
    }
  }

  const initUniver = (savedData: any) => {
    if (!containerRef.current) return
    
    // Destroy previous instance if exists
    if (univerRef.current) {
      univerRef.current.dispose()
    }

    const univer = new Univer({
      theme: defaultTheme,
      locale: LocaleType.EN_US,
    })
    
    univerRef.current = univer

    // Core Engines
    univer.registerPlugin(UniverRenderEnginePlugin)
    univer.registerPlugin(UniverFormulaEnginePlugin)
    
    // UI Plugin
    univer.registerPlugin(UniverUIPlugin, {
      container: containerRef.current,
      header: true,
      toolbar: true,
      footer: true,
    })
    
    // Docs Plugins (Required for cell editing)
    univer.registerPlugin(UniverDocsPlugin, { hasScroll: false })
    univer.registerPlugin(UniverDocsUIPlugin)
    
    // Sheets Plugins
    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsUIPlugin)
    univer.registerPlugin(UniverSheetsFormulaPlugin)
    univer.registerPlugin(UniverSheetsNumfmtPlugin)

    // Create the workbook
    const initialData = savedData || {
      id: 'workbook-01',
      sheetOrder: ['sheet-01'],
      name: 'Univer',
      appVersion: '3.0.0-alpha',
      sheets: {
        'sheet-01': {
          type: 0,
          id: 'sheet-01',
          name: 'Sheet1',
          cellData: {},
        }
      }
    }
    
    univer.createUnit(UniverInstanceType.UNIVER_SHEET, initialData)
    
    // Create Facade API for easy access
    univerAPIRef.current = FUniver.newAPI(univer)
  }

  const handleSave = async () => {
    if (!univerAPIRef.current || saving) return;
    
    try {
      setSaving(true)
      
      // Get active workbook snapshot
      const activeWorkbook = univerAPIRef.current.getActiveWorkbook()
      if (!activeWorkbook) throw new Error("No active workbook")
        
      const allData = activeWorkbook.getSnapshot()
      
      const { error } = await supabase
        .from('spreadsheets')
        .update({ data: allData, last_opened_at: new Date().toISOString() })
        .eq('id', spreadsheetId)

      if (error) {
        throw error
      }
      alert('Data saved successfully!')
    } catch (e: any) {
      console.error("Error saving:", e)
      alert("Failed to save: " + e.message)
    } finally {
      setSaving(false)
    }
  }

  // Intercept Ctrl+S for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [saving])

  // Cleanup Univer on unmount
  useEffect(() => {
    return () => {
      if (univerRef.current) {
        univerRef.current.dispose()
      }
    }
  }, [])

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Custom Header overlay */}
      <div className="absolute top-2 left-2 z-50 flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-slate-100 shadow-sm border-slate-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Folder
        </Button>
        <span className="font-semibold text-sm bg-white/80 px-2 py-1 rounded shadow-sm">{sheetName}</span>
      </div>
      
      <div className="absolute top-2 right-2 z-50">
        <Button 
          onClick={handleSave} 
          disabled={saving || loading}
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save (Ctrl+S)'}
        </Button>
      </div>

      {/* Univer Container */}
      <div ref={containerRef} className="w-full h-full m-0 p-0 absolute top-0 left-0"></div>
    </div>
  )
}
