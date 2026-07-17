import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus, Shield, Activity, MoreVertical, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function Team() {
  const { user } = useAuth()
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Editor')
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTeam()
    }
  }, [user])

  const fetchTeam = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select('*')
      
      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error('Error fetching team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    try {
      // For demo: create a fake user ID for the invitee and insert them
      const fakeUserId = crypto.randomUUID()
      let workspaceId = teamMembers.length > 0 ? teamMembers[0].workspace_id : null
      
      if (!workspaceId) {
        // Fallback: get current user's workspace
        const { data: mem } = await supabase.from('workspace_members').select('workspace_id').eq('user_id', user?.id).maybeSingle()
        workspaceId = mem?.workspace_id
      }

      if (!workspaceId) throw new Error("No workspace found")

      const { error } = await supabase.from('workspace_members').insert({
        workspace_id: workspaceId,
        user_id: fakeUserId,
        role: inviteRole
      })

      if (error) throw error

      setInviteEmail('')
      setInviteDialogOpen(false)
      fetchTeam()
    } catch (error: any) {
      console.error(error)
      alert('Failed to invite member: ' + error.message)
    }
  }

  const handleRemove = async (id: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return
    try {
      const { error } = await supabase.from('workspace_members').delete().eq('id', id)
      if (error) throw error
      fetchTeam()
    } catch (error: any) {
      console.error(error)
      alert('Failed to remove member: ' + error.message)
    }
  }

  const handleChangeRole = async (id: string, newRole: string) => {
    try {
      const { error } = await supabase.from('workspace_members').update({ role: newRole }).eq('id', id)
      if (error) throw error
      fetchTeam()
    } catch (error: any) {
      console.error(error)
      alert('Failed to change role: ' + error.message)
    }
  }

  // Calculate some fake productivity
  const avgProductivity = teamMembers.length > 0 ? Math.min(100, teamMembers.length * 15 + 20) : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team & Productivity</h1>
          <p className="text-muted-foreground mt-1">Manage workspace members and view performance.</p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button><UserPlus className="w-4 h-4 mr-2" /> Invite Member</Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleInvite}>
              <DialogHeader>
                <DialogTitle>Invite New Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="colleague@company.com" 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <select 
                    id="role" 
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="Viewer">Viewer</option>
                    <option value="Editor">Editor</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                <Button type="submit">Send Invite</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Shield className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Productivity</CardTitle>
            <Activity className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">+{avgProductivity}%</div>
            <p className="text-xs text-muted-foreground mt-1">Compared to last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : teamMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  No team members found.
                </TableCell>
              </TableRow>
            ) : (
              teamMembers.map((member, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className="font-medium text-xs font-mono">{member.user_id}</div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {member.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">{new Date(member.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'Admin')}>Make Admin</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'Editor')}>Make Editor</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleChangeRole(member.id, 'Viewer')}>Make Viewer</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemove(member.id)} className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950"><Trash2 className="w-4 h-4 mr-2" /> Remove</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
