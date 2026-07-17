import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Plus, MoreVertical, Trash2, Edit2, Download, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { logAction } from '@/lib/audit'

export default function FolderDetails() {
  const { folderId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [folderName, setFolderName] = useState('Loading...')
  const [spreadsheets, setSpreadsheets] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [newSheetName, setNewSheetName] = useState('')
  const [isSheetDialogOpen, setSheetDialogOpen] = useState(false)
  
  // State for renaming
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<any>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (user && folderId) {
      fetchFolderDetails()
    }
  }, [user, folderId])

  const fetchFolderDetails = async () => {
    setLoading(true)
    try {
      // Fetch folder name
      const { data: folderData, error: folderError } = await supabase
        .from('folders')
        .select('name')
        .eq('id', folderId)
        .single()
      
      if (folderError) throw folderError
      setFolderName(folderData.name)

      // Fetch spreadsheets in this folder
      const { data: sheets, error: sheetsError } = await supabase
        .from('spreadsheets')
        .select('*')
        .eq('folder_id', folderId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (sheetsError) throw sheetsError
      setSpreadsheets(sheets || [])
      
    } catch (error) {
      console.error('Error fetching folder details:', error)
      setFolderName('Unknown Folder')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSpreadsheet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSheetName.trim()) return

    try {
      const { data: sheetData, error } = await supabase.from('spreadsheets').insert({
        name: newSheetName,
        folder_id: folderId,
        created_by: user?.id
      }).select().single()
      if (error) throw error
      
      await logAction(user?.id, 'CREATE', 'spreadsheets', sheetData.id)

      setNewSheetName('')
      setSheetDialogOpen(false)
      fetchFolderDetails() // Refresh list
    } catch (error: any) {
      console.error('Error creating spreadsheet:', error)
      alert(`Failed to create spreadsheet: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this spreadsheet?')) return
    try {
      const { error } = await supabase.from('spreadsheets').update({ is_deleted: true }).eq('id', id)
      if (error) throw error
      
      await logAction(user?.id, 'DELETE', 'spreadsheets', id)
      fetchFolderDetails()
    } catch (e: any) {
      console.error(e)
      alert('Failed to delete spreadsheet: ' + e.message)
    }
  }

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !activeItem) return
    try {
      const { error } = await supabase.from('spreadsheets').update({ name: editName }).eq('id', activeItem.id)
      if (error) throw error
      
      await logAction(user?.id, 'EDIT', 'spreadsheets', activeItem.id)
      setRenameDialogOpen(false)
      fetchFolderDetails()
    } catch (e: any) {
      console.error(e)
      alert('Failed to rename spreadsheet: ' + e.message)
    }
  }

  const openRenameDialog = (item: any) => {
    setActiveItem(item)
    setEditName(item.name)
    setRenameDialogOpen(true)
  }

  const filteredSheets = spreadsheets.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/folders')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{folderName}</h1>
          <p className="text-muted-foreground mt-1">Manage spreadsheets inside this folder.</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Input 
            placeholder="Search spreadsheets..." 
            className="w-64" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <Dialog open={isSheetDialogOpen} onOpenChange={setSheetDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Spreadsheet</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleCreateSpreadsheet}>
              <DialogHeader>
                <DialogTitle>Create New Spreadsheet</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Spreadsheet Name (e.g. Budget 2026)" 
                    className="col-span-3"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredSheets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                  No spreadsheets found in this folder.
                </TableCell>
              </TableRow>
            ) : (
              filteredSheets.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => navigate(`/spreadsheet/${item.id}`)}
                >
                  <TableCell className="font-medium flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    {item.name}
                  </TableCell>
                  <TableCell className="text-slate-500">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => openRenameDialog(item)}><Edit2 className="w-4 h-4 mr-2" /> Rename</DropdownMenuItem>
                        <DropdownMenuItem><Download className="w-4 h-4 mr-2" /> Download</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <form onSubmit={handleRename}>
            <DialogHeader>
              <DialogTitle>Rename Spreadsheet</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editName" className="text-right">Name</Label>
                <Input 
                  id="editName" 
                  className="col-span-3"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
