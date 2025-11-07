"use client"

import React from "react"
import { ConfirmDialog } from "./ConfirmDialog"

export function DeleteConfirmDialog({ title = "Delete", message, onConfirm, trigger }: { title?: string; message: string | React.ReactNode; onConfirm: ()=>void|Promise<void>; trigger?: React.ReactNode }) {
  return (
    <ConfirmDialog
      title={title}
      message={
        <div className="space-y-2">
          <div className="text-sm">{message}</div>
          <div className="text-xs text-red-600">This action is irreversible.</div>
        </div>
      }
      onConfirm={onConfirm}
      variant="danger"
      trigger={trigger}
      requireText="DELETE"
      confirmText="Delete"
    />
  )
}
