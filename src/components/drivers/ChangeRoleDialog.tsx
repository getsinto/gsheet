"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useChangeDriverRole, useDriver } from "@/lib/hooks/useDrivers"
import { toast } from "react-hot-toast"

export function ChangeRoleDialog({ id, open, onOpenChange, onChanged }: { id: string; open: boolean; onOpenChange: (o:boolean)=>void; onChanged?: ()=>void }) {
  const { data } = useDriver(id)
  const change = useChangeDriverRole()
  const [role, setRole] = React.useState(data?.role || 'driver')
  const [confirm, setConfirm] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(()=>{ if (data?.role) setRole(data.role) }, [data?.role])

  const onSubmit = async ()=>{
    if (!confirm) { toast.error('Please confirm the role change.'); return }
    try {
      setSubmitting(true)
      await change.mutateAsync({ id, role: role as any })
      toast.success('Role updated')
      onOpenChange(false)
      onChanged?.()
    } catch (e:any) {
      toast.error(e?.message || 'Failed to update role')
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>Changing a user role requires admin permission.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <select className="w-full rounded border bg-background p-2 text-sm" value={role} onChange={(e)=>setRole(e.target.value)}>
            <option value="driver">Driver</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="admin">Admin</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={confirm} onChange={(e)=>setConfirm(e.target.checked)} />
            I understand this will change permissions for this user.
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSubmit} disabled={submitting || !confirm}>{submitting? 'Saving…':'Confirm'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
