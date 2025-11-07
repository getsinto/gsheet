"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"

export function ReportIssueModal({ open, onOpenChange, orderId }: { open: boolean; onOpenChange: (o:boolean)=>void; orderId: string }) {
  const [type, setType] = React.useState('Delayed pickup')
  const [desc, setDesc] = React.useState('')
  const [urgency, setUrgency] = React.useState<'low'|'medium'|'high'>('medium')
  const [loading, setLoading] = React.useState(false)
  const [file, setFile] = React.useState<File|undefined>()

  const submit = async ()=>{
    if (!desc.trim()) { toast.error('Please describe the issue'); return }
    try {
      setLoading(true)
      // Optionally upload a photo first
      let photoUrl: string | undefined
      if (file) {
        const fd = new FormData(); fd.append('file', file)
        const r = await fetch(`/api/orders/${orderId}/photos`, { method:'POST', body: fd })
        const j = await r.json(); if (!r.ok) throw new Error(j?.message||'Photo upload failed')
        photoUrl = j?.url
      }
      const res = await fetch(`/api/orders/${orderId}/comments`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ content: `[ISSUE] ${type} (${urgency.toUpperCase()}): ${desc}` }) })
      if (!res.ok) throw new Error(await res.text())
      // Mark delayed if urgency high or type suggests delay
      if (type.toLowerCase().includes('delay') || urgency==='high') {
        await fetch(`/api/orders/${orderId}/status`, { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status:'delayed', reason: desc.slice(0,120) }) })
      }
      toast.success('Issue reported. Admin will contact you.')
      onOpenChange(false)
    } catch (e:any) { toast.error(e?.message || 'Failed to report') } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Issue type</Label>
            <select className="w-full rounded border bg-background p-2 text-sm" value={type} onChange={(e)=>setType(e.target.value)}>
              {['Delayed pickup','Container issue','Customer not available','Address incorrect','Vehicle problem','Other'].map(o=> <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea rows={4} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Describe the problem..." />
          </div>
          <div className="space-y-1">
            <Label>Urgency</Label>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="radio" checked={urgency==='low'} onChange={()=>setUrgency('low')} /> Low</label>
              <label className="flex items-center gap-2"><input type="radio" checked={urgency==='medium'} onChange={()=>setUrgency('medium')} /> Medium</label>
              <label className="flex items-center gap-2"><input type="radio" checked={urgency==='high'} onChange={()=>setUrgency('high')} /> High</label>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Attach photo (optional)</Label>
            <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0])} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
            <Button onClick={submit} disabled={loading}>{loading? 'Reporting…':'Report Issue'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
