"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function DataExportSettings() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultMessage, setResultMessage] = useState<string|undefined>()
  const csvRef = useRef<HTMLInputElement>(null)
  const settingsRef = useRef<HTMLInputElement>(null)

  const exportSettings = async ()=>{
    const res = await fetch('/api/settings')
    const json = await res.json()
    const blob = new Blob([JSON.stringify(json, null, 2)], { type:'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `settings-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
  }

  const importOrders = async (file: File)=>{
    try {
      setUploading(true); setResultMessage(undefined)
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/import/orders', { method:'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Import failed')
      setResultMessage(`Imported ${json?.imported ?? 0} orders, ${json?.skipped ?? 0} skipped`)
    } catch (e:any) {
      setResultMessage(e?.message || 'Failed to import')
    } finally { setUploading(false); setProgress(0) }
  }

  const importSettings = async (file: File)=>{
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const res = await fetch('/api/settings', { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(parsed) })
      if (!res.ok) throw new Error(await res.text())
      setResultMessage('Settings imported successfully')
    } catch (e:any) {
      setResultMessage(e?.message || 'Failed to import settings')
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="font-medium">Export Data</div>
          <div className="flex flex-wrap gap-2">
            <a href="/api/export/orders" className="inline-flex"><Button type="button">Export All Orders (CSV)</Button></a>
            <a href="/api/export/drivers" className="inline-flex"><Button type="button" variant="outline">Export Drivers (CSV)</Button></a>
            <Button type="button" variant="secondary" onClick={exportSettings}>Export Settings (JSON)</Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="font-medium">Backup</div>
          <div className="flex items-center gap-2 text-sm">
            Last backup: <span className="text-muted-foreground">—</span>
            <Button size="sm" variant="outline" onClick={exportSettings}>Create Backup Now</Button>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Scheduled backups</label>
            <select className="rounded border bg-background p-2 text-sm">
              <option>Daily</option><option>Weekly</option><option>Monthly</option>
            </select>
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="font-medium">Import Orders from CSV</div>
          <div className="flex items-center gap-2">
            <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importOrders(f) }} />
            <Button type="button" onClick={()=>csvRef.current?.click()}>Choose CSV…</Button>
            <a href="/api/export/orders" className="text-sm text-primary underline">Download template</a>
          </div>
          {uploading && <Progress value={progress} />}
          {resultMessage && <div className="text-sm text-muted-foreground">{resultMessage}</div>}
        </div>
        <div className="space-y-2">
          <div className="font-medium">Import Settings</div>
          <div className="flex items-center gap-2">
            <input ref={settingsRef} type="file" accept="application/json,.json" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) importSettings(f) }} />
            <Button type="button" variant="outline" onClick={()=>settingsRef.current?.click()}>Choose JSON…</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
