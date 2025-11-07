"use client"

import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { format as formatDateFn } from "date-fns"

export type DatePickerProps = {
  value?: Date | null
  onChange?: (date: Date | null) => void
  minDate?: Date
  maxDate?: Date
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, minDate, maxDate, placeholder = "Pick a date", className = "" }: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const onSelect = (d?: Date) => { onChange?.(d ?? null); setOpen(false) }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={`w-full justify-start text-left font-normal ${className}`}>
          {value ? formatDateFn(value, "MMM dd, yyyy") : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar selected={value ?? undefined} onSelect={(d)=>onSelect(d)} disabled={(d)=> (minDate && d < minDate) || (maxDate && d > maxDate)} initialFocus mode="single" />
        <div className="flex items-center justify-between gap-2 p-2">
          <Button size="sm" variant="outline" onClick={()=>onChange?.(null)}>Clear</Button>
          <Button size="sm" onClick={()=>onSelect(new Date())}>Today</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export type DateRange = { from?: Date; to?: Date }

export function DateRangePicker({ value, onChange, presets = true }: { value?: DateRange; onChange?: (v: DateRange)=>void; presets?: boolean }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal">
          <span>{value?.from ? formatDateFn(value.from, "MMM dd, yyyy") : "Start"} — {value?.to ? formatDateFn(value.to, "MMM dd, yyyy") : "End"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="range" selected={value as any} onSelect={(r:any)=>onChange?.(r)} numberOfMonths={2} initialFocus />
        <div className="flex items-center justify-between gap-2 p-2">
          <Button size="sm" variant="outline" onClick={()=>onChange?.({})}>Clear</Button>
          {presets && (
            <div className="flex gap-1">
              <Button size="sm" variant="secondary" onClick={()=>{ const t=new Date(); onChange?.({ from: t, to: t }) }}>Today</Button>
              <Button size="sm" variant="secondary" onClick={()=>{ const t=new Date(); const s=new Date(t); s.setDate(t.getDate()-6); onChange?.({ from: s, to: t }) }}>Last 7d</Button>
              <Button size="sm" variant="secondary" onClick={()=>{ const t=new Date(); const s=new Date(t.getFullYear(), t.getMonth(), 1); onChange?.({ from: s, to: t }) }}>This Month</Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
