import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

function ActionBadge({ action }: { action: string }) {
  const colorMap: Record<string, string> = {
    'EDIT': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'UPLOAD': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    'DELETE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'EXPORT': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  }
  
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${colorMap[action] || 'bg-slate-100 text-slate-800'}`}>
      {action}
    </span>
  )
}

export default function History() {
  const { user } = useAuth()
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchLogs()
    }
  }, [user])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error

      setAuditLogs(data || [])
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track all workspace activities.</p>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-900/50">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                  No activity found.
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium text-xs font-mono">{log.user_id}</TableCell>
                  <TableCell><ActionBadge action={log.action} /></TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">{log.target_table} ({log.target_id})</TableCell>
                  <TableCell className="text-slate-500 text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
