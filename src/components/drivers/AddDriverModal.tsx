"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateDriver } from "@/lib/hooks/useDrivers"
import { toast } from "react-hot-toast"

export function AddDriverModal({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o:boolean)=>void; onCreated?: ()=>void }) {
  const create = useCreateDriver()
  const [form, setForm] = React.useState({
    name: '', email: '', phone: '', role: 'driver', password: '', confirm: '', is_active: true,
  })
  const [submitting, setSubmitting] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent)=>{
    e.preventDefault()
    if (!form.email || !form.password || form.password!==form.confirm) {
      toast.error('Enter email and matching passwords')
      return
    }
    try {
      setSubmitting(true)
      await create.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role as any,
        password: form.password,
        is_active: form.is_active,
      })
      toast.success('Driver created')
      onOpenChange(false)
      onCreated?.()
      setForm({ name:'', email:'', phone:'', role:'driver', password:'', confirm:'', is_active:true })
    } catch (e:any) {
      toast.error(e?.message || 'Failed to create driver')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Driver</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input placeholder="Name" value={form.name} onChange={(e)=>setForm(s=>({...s,name:e.target.value}))} />
          <Input placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm(s=>({...s,email:e.target.value}))} />
          <Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm(s=>({...s,phone:e.target.value}))} />
          <div className="grid grid-cols-2 gap-2">
            <select className="rounded border bg-background p-2 text-sm" value={form.role} onChange={(e)=>setForm(s=>({...s,role:e.target.value}))}>
              <option value="driver">Driver</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="admin">Admin</option>
            </select>
            <select className="rounded border bg-background p-2 text-sm" value={String(form.is_active)} onChange={(e)=>setForm(s=>({...s,is_active: e.target.value==='true'}))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm(s=>({...s,password:e.target.value}))} />
            <Input placeholder="Confirm password" type="password" value={form.confirm} onChange={(e)=>setForm(s=>({...s,confirm:e.target.value}))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>{submitting? 'Creating…':'Create'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
