"use client"

import React, { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { SettingsForm } from "@/app/(dashboard)/admin/settings/page"
import { useRotateWeek } from "@/lib/hooks/useSettings"
import { toast } from "react-hot-toast"

export function WeekManagementSettings() {
  const { watch, register } = useFormContext<SettingsForm>()
  const currentWeek = watch('current_week') || 1
  const rotate = useRotateWeek()
  const [archiving, setArchiving] = useState(false)

  const nextWeek = currentWeek === 1 ? 2 : 1

  const onRotate = async ()=>{
    try {
      await rotate.mutateAsync()
      toast.success(`Rotated to week ${nextWeek}`)
    } catch (e:any) {
      toast.error(e?.message || 'Failed to rotate week')
    }
  }

  const onArchive = async ()=>{
    try {
      setArchiving(true)
      const res = await fetch('/api/orders/archive', { method:'POST' })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Delivered orders archived')
    } catch (e:any) {
      toast.error(e?.message || 'Failed to archive orders')
    } finally { setArchiving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="rounded border p-4">
        <div className="text-sm text-muted-foreground">Current Week</div>
        <div className="mt-1 text-2xl font-semibold">Week {currentWeek}/2</div>
        <div className="mt-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button>Rotate to Week {nextWeek}</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Rotate to Week {nextWeek}?</AlertDialogTitle>
                <AlertDialogDescription>Previous week's delivered orders will be archived and the current week setting updated.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onRotate}>Confirm</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="week_start">Week starts on</Label>
            <select id="week_start" className="w-full rounded border bg-background p-2 text-sm" {...register('week_start')}>
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="auto_rotate_schedule">Auto-rotate schedule</Label>
            <select id="auto_rotate_schedule" className="w-full rounded border bg-background p-2 text-sm" {...register('auto_rotate_schedule')}>
              <option value="weekly">Weekly</option>
              <option value="bi_weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Auto-rotate weeks</Label>
            <input type="checkbox" {...register('auto_rotate_weeks')} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="archive_retention_days">Keep archived orders for (days)</Label>
            <Input id="archive_retention_days" type="number" {...register('archive_retention_days', { valueAsNumber: true })} />
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Archive Week {currentWeek} Delivered Orders</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Archive delivered orders?</AlertDialogTitle>
                <AlertDialogDescription>This will move delivered orders into archive. You can set retention days to control when they are purged.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onArchive} disabled={archiving}>{archiving? 'Archiving…':'Confirm'}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Separator />

      <div className="rounded border border-red-300 p-4">
        <div className="mb-2 font-medium text-red-600">Danger Zone</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <DangerAction
            title="Clear all orders"
            description="Type DELETE ALL ORDERS to confirm. Archived orders within retention will be kept."
            placeholder="DELETE ALL ORDERS"
            onConfirm={async (text)=>{
              if (text !== 'DELETE ALL ORDERS') throw new Error('Confirmation text mismatch')
              const res = await fetch('/api/orders', { method:'DELETE' })
              if (!res.ok) throw new Error(await res.text())
            }}
          />
          <DangerAction
            title="Reset settings"
            description="Reset all settings to default values."
            placeholder="RESET SETTINGS"
            onConfirm={async (text)=>{
              if (text !== 'RESET SETTINGS') throw new Error('Confirmation text mismatch')
              const res = await fetch('/api/settings', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reset: true }) })
              if (!res.ok) throw new Error(await res.text())
            }}
          />
        </div>
      </div>
    </div>
  )
}

function DangerAction({ title, description, placeholder, onConfirm }: { title: string; description: string; placeholder: string; onConfirm: (text: string)=>Promise<void> }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  const doConfirm = async ()=>{
    try { setLoading(true); await onConfirm(confirmText); toast.success('Done') } catch (e:any) { toast.error(e?.message||'Failed') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-2">
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
      <Input placeholder={placeholder} value={confirmText} onChange={(e)=>setConfirmText(e.target.value)} />
      <Button variant="destructive" disabled={loading || confirmText!==placeholder} onClick={doConfirm}>{loading? 'Working…':'Confirm'}</Button>
    </div>
  )
}
