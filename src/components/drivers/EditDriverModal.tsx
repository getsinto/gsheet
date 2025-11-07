"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDriver, useUpdateDriver } from "@/lib/hooks/useDrivers"
import { toast } from "react-hot-toast"

export function EditDriverModal({ id, open, onOpenChange, onUpdated }: { id: string; open: boolean; onOpenChange: (o:boolean)=>void; onUpdated?: ()=>void }) {
  const { data, isLoading } = useDriver(id)
  const update = useUpdateDriver()
  const [form, setForm] = React.useState({ name:'', phone:'', is_active:true })
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(()=>{
    if (data) setForm({ name: data.name||'', phone: data.phone||'', is_active: !!data.is_active })
  }, [data])

  const handleSubmit = async (e: React.FormEvent)=>{
    e.preventDefault()
    try {
      setSubmitting(true)
      await update.mutateAsync({ id, updates: form })
      toast.success('Driver updated')
      onOpenChange(false)
      onUpdated?.()
    } catch (e:any) {
      toast.error(e?.message || 'Failed to update')
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading…</div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input placeholder="Name" value={form.name} onChange={(e)=>setForm(s=>({...s,name:e.target.value}))} />
            <Input placeholder="Phone" value={form.phone} onChange={(e)=>setForm(s=>({...s,phone:e.target.value}))} />
            <select className="w-full rounded border bg-background p-2 text-sm" value={String(form.is_active)} onChange={(e)=>setForm(s=>({...s,is_active:e.target.value==='true'}))}>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting? 'Saving…':'Save changes'}</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
