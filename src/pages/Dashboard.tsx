import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, FolderOpen, Users, FileSpreadsheet, HardDrive, Database } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    folders: 0,
    spreadsheets: 0,
    users: 0
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  const fetchStats = async () => {
    try {
      const { count: foldersCount } = await supabase.from('folders').select('*', { count: 'exact', head: true })
      const { count: sheetsCount } = await supabase.from('spreadsheets').select('*', { count: 'exact', head: true })
      const { count: usersCount } = await supabase.from('workspace_members').select('*', { count: 'exact', head: true })
      
      setStats({
        folders: foldersCount || 0,
        spreadsheets: sheetsCount || 0,
        users: usersCount || 0
      })

      // Fetch recent logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (logs) setRecentActivity(logs)

    } catch (e) {
      console.error("Error fetching stats", e)
    }
  }

  const statCards = [
    { name: 'Total Folders', value: stats.folders.toString(), icon: FolderOpen },
    { name: 'Total Spreadsheets', value: stats.spreadsheets.toString(), icon: FileSpreadsheet },
    { name: 'Active Users', value: stats.users.toString(), icon: Users },
    { name: 'Storage Used', value: '0 MB', icon: HardDrive },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of your Cloud Spreadsheet Workspace.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.name} className="shadow-sm border-slate-200/60 dark:border-slate-800/60 transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto mb-6 px-6">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-md">
                <Activity className="h-10 w-10 mb-3 opacity-20" />
                <p>No activity yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {log.action} <span className="font-semibold">{log.target_table}</span>
                        </p>
                        <p className="text-xs text-slate-500">{log.target_id.substring(0,8)}...</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm border-slate-200/60 dark:border-slate-800/60">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mr-4">
                <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Database</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Connected</p>
              </div>
              <div className="ml-auto font-medium text-emerald-600">Online</div>
            </div>
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mr-4">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Realtime</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Syncing</p>
              </div>
              <div className="ml-auto font-medium text-emerald-600">Online</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
