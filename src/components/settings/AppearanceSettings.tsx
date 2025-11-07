"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SettingsForm } from "@/app/(dashboard)/admin/settings/page"

const DEFAULT_STATUS_COLORS: Record<string,string> = {
  dispatched: '#eab308', // yellow
  loaded: '#22c55e',
  notified: '#065f46',
  delayed: '#f59e0b',
  cancelled: '#ef4444',
  delivered: '#6b7280',
}

export function AppearanceSettings() {
  const { register, setValue, watch } = useFormContext<SettingsForm>()
  const colors = watch('status_colors') || DEFAULT_STATUS_COLORS

  const resetColors = ()=> setValue('status_colors', DEFAULT_STATUS_COLORS, { shouldDirty: true })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <Label>Theme</Label>
          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="radio" value="system" {...register('theme')} /> System</label>
            <label className="flex items-center gap-2"><input type="radio" value="light" {...register('theme')} /> Light</label>
            <label className="flex items-center gap-2"><input type="radio" value="dark" {...register('theme')} /> Dark</label>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="font_size">Font size</Label>
          <select id="font_size" className="w-full rounded border bg-background p-2 text-sm" {...register('font_size')}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <Label>Compact mode</Label>
          <Switch {...register('compact_mode')} />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Status Colors</Label>
          <Button type="button" size="sm" variant="outline" onClick={resetColors}>Reset defaults</Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {Object.entries(DEFAULT_STATUS_COLORS).map(([status, def])=> (
            <div key={status} className="flex items-center justify-between gap-3 rounded border p-3">
              <div className="text-sm capitalize">{status}</div>
              <input type="color" value={(colors?.[status] ?? def)} onChange={(e)=> setValue(`status_colors.${status}` as any, e.target.value, { shouldDirty:true })} />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {Object.entries(DEFAULT_STATUS_COLORS).map(([status, def])=> (
            <Card key={status} className="p-3">
              <div className="text-xs text-muted-foreground">Preview</div>
              <div className="mt-2 rounded border p-2">
                <div className="text-sm font-medium">Order #{status.toUpperCase()}</div>
                <div className="mt-2 h-1.5 rounded" style={{ backgroundColor: (colors?.[status] ?? def) }} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
