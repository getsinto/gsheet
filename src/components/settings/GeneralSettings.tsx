"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { SettingsForm } from "@/app/(dashboard)/admin/settings/page"
import { toast } from "react-hot-toast"

const TIMEZONES = [
  "America/Chicago","America/New_York","America/Denver","America/Los_Angeles","America/Phoenix","America/Anchorage","Pacific/Honolulu",
  "Europe/London","Europe/Paris","Europe/Berlin","Europe/Madrid","Europe/Rome","Europe/Amsterdam","Europe/Zurich","Europe/Stockholm",
  "Asia/Dubai","Asia/Kolkata","Asia/Singapore","Asia/Tokyo","Asia/Shanghai","Asia/Hong_Kong","Asia/Bangkok","Australia/Sydney",
]

export function GeneralSettings() {
  const { register, setValue, watch } = useFormContext<SettingsForm>()
  const logo = watch('company_logo_url')

  const onLogoSelected = async (file?: File)=>{
    if (!file) return
    if (!/(png|jpe?g|svg)$/i.test(file.name)) { toast.error('Only PNG, JPG, or SVG allowed'); return }
    if (file.size > 2*1024*1024) { toast.error('Max 2MB'); return }
    try {
      const fd = new FormData(); fd.append('file', file)
      // Reuse avatar upload route to get a cloud URL; we then store it in settings
      const res = await fetch('/api/profile/avatar', { method:'POST', body: fd })
      const json = await res.json()
      const url = json.url || json.secure_url
      if (!res.ok || !url) throw new Error(json?.message || 'Upload failed')
      setValue('company_logo_url', url, { shouldDirty: true })
      toast.success('Logo uploaded')
    } catch (e:any) {
      toast.error(e?.message || 'Failed to upload logo')
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="company_name">Company Name</Label>
          <Input id="company_name" placeholder="Strong Containers Delivery" {...register('company_name')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="company_phone">Company Phone</Label>
          <Input id="company_phone" placeholder="(555) 123-4567" {...register('company_phone')} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="company_address">Company Address</Label>
          <Textarea id="company_address" rows={4} placeholder="123 Main St, City, ST 12345" {...register('company_address')} />
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Company Logo</Label>
          <div className="flex items-center gap-3">
            {logo ? (
              <img src={logo} alt="Company logo" className="h-16 w-16 rounded border object-cover" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded border text-xs text-muted-foreground">No logo</div>
            )}
            <div>
              <input id="company_logo" className="hidden" type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={(e)=>onLogoSelected(e.target.files?.[0])} />
              <Button type="button" variant="outline" onClick={()=>document.getElementById('company_logo')?.click()}>Upload</Button>
              <div className="mt-1 text-xs text-muted-foreground">PNG, JPG, or SVG up to 2MB.</div>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <Label htmlFor="time_zone">Time Zone</Label>
          <select id="time_zone" className="w-full rounded border bg-background p-2 text-sm" {...register('time_zone')}>
            {TIMEZONES.map(tz=> <option value={tz} key={tz}>{tz}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="space-y-1">
            <Label htmlFor="date_format">Date Format</Label>
            <select id="date_format" className="w-full rounded border bg-background p-2 text-sm" {...register('date_format')}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="currency">Currency</Label>
            <select id="currency" className="w-full rounded border bg-background p-2 text-sm" {...register('currency')}>
              {['USD','EUR','GBP','CAD','AUD','JPY','INR'].map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Distance Unit</Label>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="radio" value="miles" {...register('distance_unit')} /> Miles</label>
              <label className="flex items-center gap-2"><input type="radio" value="kilometers" {...register('distance_unit')} /> Kilometers</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
