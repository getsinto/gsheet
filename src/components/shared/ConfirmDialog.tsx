"use client"

import React, { useMemo, useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

export type ConfirmDialogProps = {
  title: string
  message: string | React.ReactNode
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
  trigger?: React.ReactNode
  variant?: "danger" | "warning" | "info"
  requireCheckbox?: boolean
  checkboxLabel?: string
  requireText?: string
  confirmText?: string
}

export function ConfirmDialog({ title, message, onConfirm, onCancel, trigger, variant = "info", requireCheckbox, checkboxLabel = "I understand", requireText, confirmText = "Confirm" }: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState(false)
  const [typed, setTyped] = useState("")
  const canConfirm = (!requireCheckbox || checked) && (!requireText || typed === requireText)
  const color = variant === 'danger' ? 'destructive' : variant === 'warning' ? 'secondary' : 'default'

  const doConfirm = async ()=>{ await onConfirm(); setOpen(false) }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">{message}</div>
              {requireCheckbox && (
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={(e)=>setChecked(e.target.checked)} /> {checkboxLabel}</label>
              )}
              {requireText && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Type {requireText} to confirm</div>
                  <input className="w-full rounded border bg-background p-2 text-sm" value={typed} onChange={(e)=>setTyped(e.target.value)} />
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={()=>onCancel?.()}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant={color as any} disabled={!canConfirm} onClick={doConfirm}>{confirmText}</Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
