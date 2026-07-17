import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Download, Share2, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { supabase } from '@/lib/supabase'
import * as XLSX from 'xlsx'

// Univer CSS
import '@univerjs/design/lib/index.css'
import '@univerjs/ui/lib/index.css'
import '@univerjs/docs-ui/lib/index.css'
import '@univerjs/sheets-ui/lib/index.css'
import '@univerjs/sheets-formula-ui/lib/index.css'
import '@univerjs/sheets-numfmt-ui/lib/index.css'
import '@univerjs/find-replace/lib/index.css'
import '@univerjs/sheets-crosshair-highlight/lib/index.css'
import '@univerjs/sheets-filter-ui/lib/index.css'
import '@univerjs/sheets-note-ui/lib/index.css'
import '@univerjs/sheets-sort-ui/lib/index.css'

// Univer Plugins
import { Univer, UniverInstanceType, LocaleType, IUniverInstanceService } from '@univerjs/core'
import DesignEnUS from '@univerjs/design/locale/en-US'
import UIEnUS from '@univerjs/ui/locale/en-US'
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US'
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US'
import { UniverDocsPlugin } from '@univerjs/docs'
import { UniverDocsUIPlugin } from '@univerjs/docs-ui'
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula'
import { UniverRenderEnginePlugin } from '@univerjs/engine-render'
import { UniverSheetsPlugin } from '@univerjs/sheets'
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula'
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui'
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt'
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui'
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui'
import { UniverUIPlugin } from '@univerjs/ui'
import { UniverSheetsConditionalFormattingPlugin } from '@univerjs/sheets-conditional-formatting'
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace'
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter'
import { UniverSheetsFilterUIPlugin } from '@univerjs/sheets-filter-ui'
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort'
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui'
import { UniverSheetsHyperLinkPlugin } from '@univerjs/sheets-hyper-link'
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight'
import { UniverSheetsNotePlugin } from '@univerjs/sheets-note'
import { UniverRPCMainThreadPlugin } from '@univerjs/rpc'
import { UniverSheetsNoteUIPlugin } from '@univerjs/sheets-note-ui'


export default function SpreadsheetEditor() {
  const { spreadsheetId } = useParams()
  const navigate = useNavigate()
  
  const [sheetName, setSheetName] = useState('Loading...')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const univerRef = useRef<any>(null)

  useEffect(() => {
    let isMounted = true

    const loadMetadata = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('spreadsheets')
          .select('name, data')
          .eq('id', spreadsheetId)
          .single()
        
        if (error) throw error
        if (!isMounted) return

        setSheetName(data.name)
        initUniver(data.data)
      } catch (e) {
        console.error(e)
        if (isMounted) setSheetName('Unknown Spreadsheet')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadMetadata()

    return () => {
      isMounted = false
      if (univerRef.current) {
        const oldUniver = univerRef.current
        setTimeout(() => {
          if (oldUniver) oldUniver.dispose()
        }, 0)
        univerRef.current = null
      }
    }
  }, [spreadsheetId])

  const initUniver = (savedData: any) => {
    if (!containerRef.current) return
    
    // Previous instance disposal is handled by useEffect cleanup

    const univer = new Univer({
      locale: LocaleType.EN_US,
      locales: {
        [LocaleType.EN_US]: {
          ...DesignEnUS,
          ...UIEnUS,
          ...DocsUIEnUS,
          ...SheetsUIEnUS,
        }
      }
    })
    
    univerRef.current = univer
    // RPC Web Worker for high-performance formula engine
    const worker = new Worker(new URL('../worker.ts', import.meta.url), { type: 'module' })
    univer.registerPlugin(UniverRPCMainThreadPlugin, { workerURL: worker })

    // Core Engines
    univer.registerPlugin(UniverRenderEnginePlugin)
    
    // Detect if mobile to hide heavy ribbon/toolbar
    const isMobile = window.innerWidth < 768

    // UI Plugin
    univer.registerPlugin(UniverUIPlugin, {
      container: containerRef.current,
      header: !isMobile, // Hide ribbon on mobile
      toolbar: !isMobile, // Hide toolbar on mobile
      footer: true,
    })
    
    // Docs Plugins (Required for cell editing)
    univer.registerPlugin(UniverDocsPlugin, { hasScroll: false })
    univer.registerPlugin(UniverDocsUIPlugin)
    
    // Sheets Plugins
    univer.registerPlugin(UniverSheetsPlugin)
    univer.registerPlugin(UniverSheetsUIPlugin)
    univer.registerPlugin(UniverSheetsFormulaPlugin)
    univer.registerPlugin(UniverSheetsFormulaUIPlugin)
    univer.registerPlugin(UniverSheetsNumfmtPlugin)
    univer.registerPlugin(UniverSheetsNumfmtUIPlugin)
    univer.registerPlugin(UniverSheetsConditionalFormattingPlugin)
    univer.registerPlugin(UniverSheetsFindReplacePlugin)
    univer.registerPlugin(UniverSheetsFilterPlugin)
    univer.registerPlugin(UniverSheetsFilterUIPlugin)
    univer.registerPlugin(UniverSheetsSortPlugin)
    univer.registerPlugin(UniverSheetsSortUIPlugin)
    univer.registerPlugin(UniverSheetsHyperLinkPlugin)
    univer.registerPlugin(UniverSheetsCrosshairHighlightPlugin)
    univer.registerPlugin(UniverSheetsNotePlugin)
    univer.registerPlugin(UniverSheetsNoteUIPlugin)

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
    
    // (Facade removed)
  }

  const handleSave = async () => {
    if (!univerRef.current || saving) return;
    
    try {
      setSaving(true)
      
      // Get active workbook snapshot
      const activeWorkbook = univerRef.current.__getInjector().get(IUniverInstanceService).getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)
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

  const generateExcelBlob = (): Blob | null => {
    if (!univerRef.current) return null;
    try {
      const activeWorkbook = univerRef.current.__getInjector().get(IUniverInstanceService).getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET)
      if (!activeWorkbook) return null
      
      const snapshot = activeWorkbook.getSnapshot()
      const wb = XLSX.utils.book_new()
      
      Object.keys(snapshot.sheets).forEach(sheetId => {
        const sheet = snapshot.sheets[sheetId]
        const cellData = sheet.cellData || {}
        
        let maxRow = 0
        let maxCol = 0
        
        Object.keys(cellData).forEach(rowStr => {
          const r = parseInt(rowStr)
          if (r > maxRow) maxRow = r
          const rowData = cellData[rowStr]
          Object.keys(rowData).forEach(colStr => {
            const c = parseInt(colStr)
            if (c > maxCol) maxCol = c
          })
        })
        
        const aoa: any[][] = Array.from({ length: maxRow + 1 }, () => Array(maxCol + 1).fill(''))
        
        Object.keys(cellData).forEach(rowStr => {
          const r = parseInt(rowStr)
          const rowData = cellData[rowStr]
          Object.keys(rowData).forEach(colStr => {
            const c = parseInt(colStr)
            const cell = rowData[colStr]
            aoa[r][c] = cell?.v ?? cell?.m ?? ''
          })
        })
        
        const ws = XLSX.utils.aoa_to_sheet(aoa)
        XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Sheet')
      })
      
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      return new Blob([wbout], { type: "application/octet-stream" })
    } catch(e) {
      console.error(e)
      return null
    }
  }

  const handleDownloadExcel = () => {
    const blob = generateExcelBlob()
    if (!blob) return alert('Gagal membuat file excel')
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sheetName || 'export'}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleSendWA = async () => {
    const blob = generateExcelBlob()
    if (!blob) return alert('Gagal membuat file excel')
      
    try {
      setExporting(true)
      const fileName = `${spreadsheetId}_${Date.now()}.xlsx`
      
      const { data, error } = await supabase.storage
        .from('exports')
        .upload(fileName, blob, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        
      if (error) throw error
      
      const { data: urlData } = supabase.storage
        .from('exports')
        .getPublicUrl(fileName)
        
      const publicUrl = urlData.publicUrl
      
      const text = encodeURIComponent(`Berikut adalah file Excel untuk dokumen "${sheetName}":\n\n${publicUrl}`)
      window.open(`https://wa.me/?text=${text}`, '_blank')
    } catch (e: any) {
      console.error(e)
      alert('Gagal mengirim ke WA: ' + e.message)
    } finally {
      setExporting(false)
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


  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Top App Bar - Mobile Responsive */}
      <header className="flex h-14 items-center justify-between px-2 md:px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-2 overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-8 w-8 md:h-9 md:w-9 shrink-0 text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" /> 
          </Button>
          <span className="font-semibold text-sm md:text-base text-slate-800 dark:text-slate-200 truncate">
            {sheetName}
          </span>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button 
            onClick={handleDownloadExcel} 
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
          >
            <Download className="w-4 h-4 mr-2" /> Excel
          </Button>
          <Button 
            onClick={handleSendWA} 
            disabled={exporting}
            variant="outline"
            size="sm"
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Share2 className="w-4 h-4 mr-2" /> {exporting ? 'Sending...' : 'WhatsApp'}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Mobile Actions (Dropdown) */}
        <div className="flex md:hidden items-center gap-1">
          <Button 
            onClick={handleSave} 
            disabled={saving || loading}
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-indigo-600"
          >
            <Save className="w-5 h-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleDownloadExcel} className="cursor-pointer">
                <Download className="w-4 h-4 mr-2 text-green-600" /> 
                <span>Export Excel</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSendWA} disabled={exporting} className="cursor-pointer">
                <Share2 className="w-4 h-4 mr-2 text-emerald-600" /> 
                <span>Kirim WhatsApp</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Univer Container - Takes remaining height */}
      <div className="flex-1 w-full relative">
        <div ref={containerRef} className="absolute inset-0 m-0 p-0"></div>
      </div>
    </div>
  )
}
