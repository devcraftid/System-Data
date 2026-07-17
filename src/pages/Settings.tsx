import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert('Settings saved successfully!')
    }, 800)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace preferences and account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Profile</CardTitle>
          <CardDescription>Update your workspace details and branding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input 
              id="workspace-name" 
              value={workspaceName} 
              onChange={(e) => setWorkspaceName(e.target.value)} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="admin-email">Admin Email</Label>
            <Input id="admin-email" value={user?.email || ''} disabled />
            <p className="text-xs text-slate-500">The primary contact for this workspace.</p>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how CloudSheet looks on your device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Dark Mode</Label>
              <p className="text-sm text-slate-500">Switch between light and dark themes.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Sidebar</Label>
              <p className="text-sm text-slate-500">Make the sidebar thinner on desktop.</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-500 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" /> Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions for your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">Delete Workspace</p>
              <p className="text-sm text-slate-500">Permanently delete all folders and spreadsheets.</p>
            </div>
            <Button variant="destructive" onClick={() => alert('Disabled for demo')}>Delete Workspace</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
