"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/hooks/useAuth"
import { toast } from "react-hot-toast"

export function EditProfileModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o:boolean)=>void }) {
  const { user } = useAuth()
  const [form, setForm] = React.useState({ name: user?.user_metadata?.name || '', phone: user?.user_metadata?.phone || '', avatar_file: undefined as File|undefined })
  const [loading, setLoading] = React.useState(false)

  const onSave = async ()=>{
    try {
      setLoading(true)
      let avatar_url
      if (form.avatar_file) {
        const fd = new FormData(); fd.append('file', form.avatar_file)
        const r = await fetch('/api/profile/avatar', { method:'POST', body: fd })
        const j = await r.json(); if (!r.ok) throw new Error(j?.message||'Upload failed')
        avatar_url = j.url || j.secure_url
      }
      const res = await fetch('/api/profile', { method:'PATCH', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone, ...(avatar_url? { avatar_url }: {}) }) })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Profile updated')
      onOpenChange(false)
    } catch (e:any) { toast.error(e?.message || 'Failed to update') } finally { setLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input placeholder="Full name" value={form.name} onChange={(e)=>setForm(s=>({...s,name:e.target.value}))} />
          <Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm(s=>({...s,phone:e.target.value}))} />
          <input type="file" accept="image/*" onChange={(e)=>setForm(s=>({...s, avatar_file: e.target.files?.[0]}))} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
            <Button onClick={onSave} disabled={loading}>{loading? 'Saving…':'Save Changes'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
