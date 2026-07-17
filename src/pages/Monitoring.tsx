import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Server, Database, Cloud, Wifi, Cpu, HardDrive } from 'lucide-react'

export default function Monitoring() {
  const [latency, setLatency] = useState(42)
  const [cpuLoad, setCpuLoad] = useState(12)

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => Math.max(20, Math.min(120, prev + (Math.random() * 20 - 10))))
      setCpuLoad(prev => Math.max(5, Math.min(95, prev + (Math.random() * 10 - 5))))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const services = [
    { name: 'API Server (Supabase)', status: 'Operational', icon: Server, color: 'text-emerald-500' },
    { name: 'Database (PostgreSQL)', status: 'Operational', icon: Database, color: 'text-emerald-500' },
    { name: 'Realtime Edge Network', status: 'Operational', icon: Cloud, color: 'text-emerald-500' },
    { name: 'Storage Buckets', status: 'Operational', icon: HardDrive, color: 'text-emerald-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
        <p className="text-muted-foreground mt-1">Real-time status of CloudSheet services and infrastructure.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Global Status</CardTitle>
            <Activity className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">All Systems Normal</div>
            <p className="text-xs text-muted-foreground mt-1">Uptime: 99.99% this month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
            <Wifi className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{Math.round(latency)} ms</div>
            <p className="text-xs text-muted-foreground mt-1">Global edge routing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Node CPU Load</CardTitle>
            <Cpu className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{Math.round(cpuLoad)}%</div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${cpuLoad}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Current status of individual cloud components.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/20">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 ${service.color}`}>
                    <service.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-slate-500">Asia Pacific Region</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-600">{service.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
