"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { SettingsForm } from "@/app/(dashboard)/admin/settings/page"

const DEFAULT_TEMPLATE = `Strong Containers Delivery
[DayOfWeek]
Driver: [DriverName]
Market: [Market]
Order: [OrderNumber]
Pickup address: [PickupAddress]
[ContainerType] [Condition]
Doors: [DoorPosition]
Release: [ReleaseNumber]
Deliver to:
[CustomerName]
[CustomerAddress]
[CustomerPhone]
Driver Pay: $[DriverPay]
Miles: [Miles]
NOTES: [Notes]
Please inspect the container and send a pic of the container and the outgate receipt from the depot when you load. Please also tell us your eta and the destination city when you are loaded and on your way.`

const VARS = [
  'DayOfWeek','DriverName','Market','OrderNumber','PickupAddress','ContainerType','Condition','DoorPosition','ReleaseNumber','CustomerName','CustomerAddress','CustomerPhone','DriverPay','Miles','Notes'
]

export function PodiumTemplateSettings() {
  const { register, setValue, getValues } = useFormContext<SettingsForm>()

  const insertVar = (name: string) => {
    const val = getValues('default_notes_template') || ''
    setValue('default_notes_template', val + (val.endsWith('\n')||val===''?'':' ' ) + `[${name}]`, { shouldDirty: true })
  }

  const preview = ()=>{
    const sample: Record<string,string|number> = {
      DayOfWeek:'Monday', DriverName:'Alex', Market:'Chicago', OrderNumber:'ON-12345', PickupAddress:'123 Depot Rd, City', ContainerType:"40' HC", Condition:'Good', DoorPosition:'Closed', ReleaseNumber:'REL-555', CustomerName:'ACME Inc', CustomerAddress:'456 Customer St, City', CustomerPhone:'(555) 111-2222', DriverPay:'350', Miles:'140', Notes:'Call on arrival.'
    }
    const tpl = getValues('default_notes_template') || DEFAULT_TEMPLATE
    const out = tpl.replace(/\[(.*?)\]/g, (_m, p1)=> String(sample[p1] ?? `[${p1}]`))
    alert(out)
  }

  const reset = ()=> setValue('default_notes_template', DEFAULT_TEMPLATE, { shouldDirty: true })

  return (
    <div className="space-y-3">
      <Label>Variables</Label>
      <div className="flex flex-wrap gap-2">
        {VARS.map(v=> <button key={v} type="button" className="rounded border px-2 py-1 text-xs hover:bg-muted" onClick={()=>insertVar(v)} aria-label={`Insert ${v}`}><Badge variant="secondary">[{v}]</Badge></button>)}
      </div>
      <div className="space-y-1">
        <Label htmlFor="template">Podium Message Template</Label>
        <Textarea id="template" className="font-mono" rows={12} placeholder="Enter template..." {...register('default_notes_template')} />
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={preview}>Preview</Button>
        <Button type="button" variant="secondary" onClick={reset}>Reset to default</Button>
      </div>
    </div>
  )
}
