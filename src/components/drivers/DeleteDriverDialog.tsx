"use client"

import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useDeleteDriver, useDriverStats } from "@/lib/hooks/useDrivers"
import { toast } from "react-hot-toast"

export function DeleteDriverDialog({ id, open, onOpenChange, onDeleted }: { id: string; open: boolean; onOpenChange: (o:boolean)=>void; onDeleted?: ()=>void }) {
  const { data: stats } = useDriverStats(id)
  const del = useDeleteDriver()
  const [confirm, setConfirm] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)

  const hasActiveOrders = (stats?.open_orders ?? 0) > 0

  const onSubmit = async ()=>{
    if (confirm.toLowerCase() !== 'delete') { toast.error('Type DELETE to confirm'); return }
    try {
      setSubmitting(true)
      await del.mutateAsync({ id })
      toast.success('Driver deleted')
      onOpenChange(false)
      onDeleted?.()
    } catch (e:any) {
      toast.error(e?.message || 'Failed to delete driver')
    } finally { setSubmitting(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Driver</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        {hasActiveOrders ? (
          <div className="space-y-3 text-sm text-red-600">
            This driver has active or recent orders assigned. Please reassign or complete those orders before deletion.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Type DELETE to confirm.</p>
            <input className="w-full rounded border bg-background p-2 text-sm" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onSubmit} disabled={submitting || hasActiveOrders || confirm.toLowerCase()!=='delete'}>{submitting? 'Deleting…':'Delete'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
