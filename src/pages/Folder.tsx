import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderOpen, FileSpreadsheet, Plus, MoreVertical, Trash2, Edit2, Download } from 'lucide-react'
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

export default function Folder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [isFolderDialogOpen, setFolderDialogOpen] = useState(false)
  
  // State for renaming
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [activeItem, setActiveItem] = useState<any>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    if (user) {
      fetchItems()
    }
  }, [user])

  const fetchItems = async () => {
    setLoading(true)
    try {
      // Fetch only root folders
      const { data: folders, error: folderError } = await supabase
        .from('folders')
        .select('*')
        .is('parent_id', null)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

      if (folderError) throw folderError

      const formattedFolders = (folders || []).map(f => ({ ...f, type: 'folder', date: new Date(f.created_at).toLocaleDateString() }))

      setItems(formattedFolders)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      // First, ensure user has a workspace or get their first one
      let workspaceId;
      const { data: memberData, error: memError } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user?.id).limit(1).maybeSingle()
      
      if (memError) throw memError;

      if (memberData) {
        workspaceId = memberData.workspace_id
      } else {
        // Create a default workspace if none exists
        const { data: ws, error: wsError } = await supabase.from('workspaces').insert({ name: 'My Workspace', created_by: user?.id }).select().single()
        if (wsError) throw wsError
        workspaceId = ws.id
        await supabase.from('workspace_members').insert({ workspace_id: workspaceId, user_id: user?.id, role: 'Owner' })
      }

      const { data: folderData, error } = await supabase.from('folders').insert({
        name: newFolderName,
        workspace_id: workspaceId,
        created_by: user?.id
      }).select().single()
      if (error) throw error

      await logAction(user?.id, 'CREATE', 'folders', folderData.id)

      setNewFolderName('')
      setFolderDialogOpen(false)
      fetchItems() // Refresh list
    } catch (error: any) {
      console.error('Error creating folder:', error)
      alert(`Failed to create folder: ${error.message || 'Unknown error'}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this folder? All spreadsheets inside will also be inaccessible.')) return
    try {
      const { error } = await supabase.from('folders').update({ is_deleted: true }).eq('id', id)
      if (error) throw error
      
      await logAction(user?.id, 'DELETE', 'folders', id)
      fetchItems()
    } catch (e: any) {
      console.error(e)
      alert('Failed to delete folder: ' + e.message)
    }
  }

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !activeItem) return
    try {
      const { error } = await supabase.from('folders').update({ name: editName }).eq('id', activeItem.id)
      if (error) throw error
      
      await logAction(user?.id, 'EDIT', 'folders', activeItem.id)
      setRenameDialogOpen(false)
      fetchItems()
    } catch (e: any) {
      console.error(e)
      alert('Failed to rename folder: ' + e.message)
    }
  }

  const openRenameDialog = (item: any) => {
    setActiveItem(item)
    setEditName(item.name)
    setRenameDialogOpen(true)
  }

  const filteredItems = items.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Folders</h1>
          <p className="text-muted-foreground mt-1">Manage your workspaces and folders here.</p>
        </div>
        
        <div className="flex gap-3">
          <Dialog open={isFolderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button><FolderOpen className="w-4 h-4 mr-2" /> New Folder</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateFolder}>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input 
                      id="name" 
                      placeholder="Folder Name" 
                      className="col-span-3"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
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
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search folders..." 
          className="max-w-sm" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-slate-500">
                  No folders found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  onClick={() => navigate(`/folders/${item.id}`)}
                >
                  <TableCell className="font-medium flex items-center gap-3">
                    <FolderOpen className="w-5 h-5 text-indigo-500 fill-indigo-500/20" /> 
                    {item.name}
                  </TableCell>
                  <TableCell className="text-slate-500">{item.date}</TableCell>
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
              <DialogTitle>Rename Folder</DialogTitle>
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
