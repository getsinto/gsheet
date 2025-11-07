"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { orderSchema, type OrderInput } from "@/lib/validations/schemas"
import { useCreateOrder } from "@/lib/hooks/useOrders"
import { toast } from "react-hot-toast"

export function CreateOrderModal({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void }) {
  const today = new Date().toISOString().slice(0, 10)
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      date: today,
      delivery_window: 'AM' as any,
      week_number: 1 as any,
    },
  })
  const create = useCreateOrder()

  const onSubmit = async (values: any) => {
    try {
      await create.mutateAsync(values)
      toast.success('Order created')
      onOpenChange(false)
      onCreated()
      reset()
    } catch (e: any) {
      toast.error('Failed to create order')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-auto">
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="driver">Driver</TabsTrigger>
              <TabsTrigger value="pickup">Pickup</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>
            <TabsContent value="basic" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Date</label>
                  <Input type="date" {...register('date')} />
                  {errors.date && <p className="text-xs text-red-600">{errors.date.message as any}</p>}
                </div>
                <div>
                  <label className="text-xs">Delivery Window</label>
                  <select className="w-full rounded border bg-background p-2 text-sm" {...register('delivery_window' as any)}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Market</label>
                  <Input {...register('market')} />
                </div>
                <div>
                  <label className="text-xs">Week Number</label>
                  <select className="w-full rounded border bg-background p-2 text-sm" {...register('week_number' as any, { valueAsNumber: true })}>
                    <option value={1}>Week 1</option>
                    <option value={2}>Week 2</option>
                  </select>
                  {errors.week_number && <p className="text-xs text-red-600">{errors.week_number.message as any}</p>}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="driver" className="space-y-3">
              <DriverPicker controlRegisterId={register as any} onPick={(d)=>{ /* keep RHF in sync */ }} />
            </TabsContent>
            <TabsContent value="pickup" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Pickup Street</label>
                  <Input {...register('pickup_street')} />
                </div>
                <div>
                  <label className="text-xs">Pickup City</label>
                  <Input {...register('pickup_city')} />
                </div>
                <div>
                  <label className="text-xs">State</label>
                  <Input {...register('pickup_state')} />
                </div>
                <div>
                  <label className="text-xs">ZIP</label>
                  <Input {...register('pickup_zip')} />
                </div>
                <div>
                  <label className="text-xs">Container Type</label>
                  <Input {...register('container_type')} />
                </div>
                <div>
                  <label className="text-xs">Condition</label>
                  <Input {...register('container_condition')} />
                </div>
                <div>
                  <label className="text-xs">Door Position</label>
                  <select className="w-full rounded border bg-background p-2 text-sm" {...register('door_position' as any)}>
                    <option value="">—</option>
                    <option value="forward to cab">forward to cab</option>
                    <option value="away from cab">away from cab</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Release Number</label>
                  <Input {...register('release_number')} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="delivery" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Customer Name</label>
                  <Input {...register('customer_name')} />
                </div>
                <div>
                  <label className="text-xs">Customer Street</label>
                  <Input {...register('customer_street')} />
                </div>
                <div>
                  <label className="text-xs">City</label>
                  <Input {...register('customer_city')} />
                </div>
                <div>
                  <label className="text-xs">State</label>
                  <Input {...register('customer_state')} />
                </div>
                <div>
                  <label className="text-xs">ZIP</label>
                  <Input {...register('customer_zip')} />
                </div>
                <div>
                  <label className="text-xs">Phone</label>
                  <Input {...register('customer_phone')} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="additional" className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs">Miles</label>
                  <Input type="number" step="1" {...register('miles', { valueAsNumber: true } as any)} />
                </div>
                <div>
                  <label className="text-xs">Driver Pay</label>
                  <Input type="number" step="0.01" {...register('driver_pay', { valueAsNumber: true } as any)} />
                </div>
              </div>
              <div>
                <label className="text-xs">Notes</label>
                <Input {...register('notes')} />
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || create.isPending}>{create.isPending ? 'Creating...' : 'Create Order'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DriverPicker({ controlRegisterId, onPick }: { controlRegisterId: any; onPick: (d: { id: string; full_name: string })=>void }) {
  const [drivers, setDrivers] = React.useState<Array<{ id: string; full_name: string }>>([])
  const [selected, setSelected] = React.useState<string>("")
  const { ref, onChange, name } = (controlRegisterId('driver_id') as any)
  const { ref: refName, onChange: onChangeName } = (controlRegisterId('driver_name') as any)

  React.useEffect(() => {
    let active = true
    fetch('/api/drivers', { credentials:'include' })
      .then(r=>r.json())
      .then(j=>{
        const arr = (j && j.data) ? j.data : (Array.isArray(j) ? j : [])
        if (active) setDrivers(arr)
      })
      .catch(()=>{})
    return ()=>{ active = false }
  }, [])

  const pick = (id: string) => {
    setSelected(id)
    const d = drivers.find(x=>x.id===id)
    const nameVal = d?.full_name ?? ''
    onChange({ target:{ name:'driver_id', value:id } })
    onChangeName({ target:{ name:'driver_name', value:nameVal } })
    onPick({ id, full_name: nameVal })
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="text-xs">Driver</label>
        <select className="w-full rounded border bg-background p-2 text-sm" value={selected} onChange={(e)=>pick(e.target.value)} ref={ref} name={name}>
          <option value="">Select driver…</option>
          {drivers.map(d=> <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs">Driver Name</label>
        <Input readOnly value={drivers.find(x=>x.id===selected)?.full_name ?? ''} ref={refName} />
      </div>
    </div>
  )
}
