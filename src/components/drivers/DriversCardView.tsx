"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToggleDriverStatus } from "@/lib/hooks/useDrivers"
import { toast } from "react-hot-toast"
import { ChangeRoleDialog } from "./ChangeRoleDialog"
import { DeleteDriverDialog } from "./DeleteDriverDialog"
import { EditDriverModal } from "./EditDriverModal"
import { DriverDetailModal } from "./DriverDetailModal"

export function DriversCardView({ data, isLoading, onChanged }: { data: any[]; isLoading?: boolean; onChanged?: ()=>void }) {
  const [roleId, setRoleId] = React.useState<string|null>(null)
  const [deleteId, setDeleteId] = React.useState<string|null>(null)
  const [editId, setEditId] = React.useState<string|null>(null)
  const [detailId, setDetailId] = React.useState<string|null>(null)
  const toggle = useToggleDriverStatus()

  if (isLoading) return <div className="grid grid-cols-1 gap-3 md:grid-cols-3">{Array.from({length:6}).map((_,i)=> (<Card key={i} className="h-28 animate-pulse" />))}</div>
  if (!data?.length) return <Card className="p-6 text-center text-muted-foreground">No drivers found</Card>

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((d)=> (
        <Card key={d.id} className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={d.avatar_url||''} />
              <AvatarFallback>{(d.name||d.email||'?').slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{d.name||'Unnamed'}</div>
              <div className="text-xs text-muted-foreground">{d.email}</div>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <Badge variant={d.is_active? 'default':'secondary'}>{d.is_active?'Active':'Inactive'}</Badge>
                <span>{d.orders_count ?? 0} orders</span>
                <span>${(d.earnings_this_week ?? 0).toFixed(2)} wk</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={()=>setDetailId(d.id)}>View</Button>
            <Button size="sm" variant="outline" onClick={()=>setEditId(d.id)}>Edit</Button>
            <Button size="sm" variant="outline" onClick={()=>setRoleId(d.id)}>Role</Button>
            <Button size="sm" variant={d.is_active? 'secondary':'default'} onClick={async()=>{
              try {
                await toggle.mutateAsync({ id: d.id, active: !d.is_active })
                toast.success(`Driver ${!d.is_active? 'activated':'deactivated'}`)
                onChanged?.()
              } catch (e:any) {
                toast.error(e?.message || 'Failed to toggle')
              }
            }}>{d.is_active? 'Deactivate':'Activate'}</Button>
            <Button size="sm" variant="destructive" onClick={()=>setDeleteId(d.id)}>Delete</Button>
          </div>
        </Card>
      ))}

      {detailId && (<DriverDetailModal id={detailId} open={!!detailId} onOpenChange={(o)=>{ if(!o) setDetailId(null) }} />)}
      {editId && (<EditDriverModal id={editId} open={!!editId} onOpenChange={(o)=>{ if(!o) setEditId(null) }} onUpdated={onChanged} />)}
      {roleId && (<ChangeRoleDialog id={roleId} open={!!roleId} onOpenChange={(o)=>{ if(!o) setRoleId(null) }} onChanged={onChanged} />)}
      {deleteId && (<DeleteDriverDialog id={deleteId} open={!!deleteId} onOpenChange={(o)=>{ if(!o) setDeleteId(null) }} onDeleted={onChanged} />)}
    </div>
  )
}
