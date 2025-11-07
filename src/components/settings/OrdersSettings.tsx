"use client"

import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SettingsForm } from "@/app/(dashboard)/admin/settings/page"
import { GripVertical, Plus, Trash2, ArrowUp, ArrowDown, Info } from "lucide-react"

export function OrdersSettings() {
  const { register, control } = useFormContext<SettingsForm>()
  const ct = useFieldArray({ control, name: 'container_types' as const })
  const mk = useFieldArray({ control, name: 'markets' as const })

  const moveUp = (fa: typeof ct, index: number)=> index>0 && fa.move(index, index-1)
  const moveDown = (fa: typeof ct, index: number)=> index<fa.fields.length-1 && fa.move(index, index+1)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="default_pay_rate">Default Pay Rate ($/mile)</Label>
            <Input id="default_pay_rate" type="number" step="0.01" placeholder="2.50" {...register('default_pay_rate', { valueAsNumber: true })} />
            <p className="text-xs text-muted-foreground">Used to auto-calculate driver pay</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-generate Order Numbers</Label>
            </div>
            <Switch {...register('auto_generate_order_numbers')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="order_number_prefix">Format prefix</Label>
              <Input id="order_number_prefix" placeholder="ON" {...register('order_number_prefix')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="order_number_start">Starting number</Label>
              <Input id="order_number_start" type="number" {...register('order_number_start', { valueAsNumber: true })} />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Auto-lock delivered orders</Label>
            <Switch {...register('auto_lock_delivered')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="default_notes_template">Default notes template</Label>
            <Textarea id="default_notes_template" rows={5} {...register('default_notes_template')} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Allow drivers to edit orders</Label>
            <Switch {...register('drivers_can_edit_orders')} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require photos before delivery</Label>
            <Switch {...register('require_photos_before_delivery')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <EditableList title="Container Types" fa={ct} placeholder="Add container type" defaults={["40' HC","20' STD","40' STD","20' HC","45' HC","53'"]} />
        <EditableList title="Markets" fa={mk} placeholder="Add market" defaults={["Chicago","Indianapolis","Milwaukee","Detroit"]} />
      </div>
    </div>
  )
}

function EditableList({ title, fa, placeholder, defaults }: { title: string; fa: ReturnType<typeof useFieldArray<SettingsForm>>; placeholder: string; defaults: string[] }) {
  const { register } = useFormContext<SettingsForm>()
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button size="sm" variant="outline" onClick={()=>fa.append("") }><Plus className="mr-1 h-4 w-4" /> Add</Button>
      </div>
      <div className="space-y-2">
        {fa.fields.length===0 && (
          <div className="rounded border p-3 text-sm text-muted-foreground">No items. Quick add: {defaults.join(', ')}</div>
        )}
        {fa.fields.map((f, i)=> (
          <div key={f.id} className="flex items-center gap-2">
            <button type="button" className="rounded border p-1 text-muted-foreground hover:bg-muted" onClick={()=>fa.move(i, i)} aria-label="Drag handle"><GripVertical className="h-4 w-4" /></button>
            <Input {...register(`${fa.name}.${i}` as any)} placeholder={placeholder} />
            <div className="flex items-center gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={()=>fa.remove(i)} aria-label="Remove"><Trash2 className="h-4 w-4" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={()=>moveUp(fa as any, i)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
              <Button type="button" size="icon" variant="ghost" onClick={()=>moveDown(fa as any, i)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
      {fa.fields.length===0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {defaults.map((d, idx)=> (
            <Button key={idx} size="sm" variant="secondary" type="button" onClick={()=>fa.append(d)}>{d}</Button>
          ))}
        </div>
      )}
    </div>
  )
}
