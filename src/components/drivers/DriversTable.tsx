"use client"

import Image from "next/image"
import React, { useMemo, useState } from "react"
import { ArrowUpDown, BadgeCheck, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToggleDriverStatus } from "@/lib/hooks/useDrivers"
import { toast } from "react-hot-toast"
import { DriverDetailModal } from "./DriverDetailModal"
import { EditDriverModal } from "./EditDriverModal"
import { ChangeRoleDialog } from "./ChangeRoleDialog"
import { DeleteDriverDialog } from "./DeleteDriverDialog"

export type DriverRow = {
  id: string
  name: string
  email: string
  phone?: string
  role: 'admin'|'driver'|'dispatcher'
  is_active: boolean
  avatar_url?: string
  created_at?: string
  orders_count?: number
  earnings_this_week?: number
}

export function DriversTable({
  data,
  isLoading,
  total,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  onChanged,
}: {
  data: DriverRow[]
  isLoading?: boolean
  total: number
  page: number
  perPage: number
  onPageChange: (p:number)=>void
  onPerPageChange: (pp:number)=>void
  onChanged?: ()=>void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [sort, setSort] = useState<{key: keyof DriverRow; dir: 'asc'|'desc'}>({key:'name', dir:'asc'})
  const [detailId, setDetailId] = useState<string|null>(null)
  const [editId, setEditId] = useState<string|null>(null)
  const [roleId, setRoleId] = useState<string|null>(null)
  const [deleteId, setDeleteId] = useState<string|null>(null)

  const toggleMutation = useToggleDriverStatus()

  const sorted = useMemo(()=>{
    const arr = [...data]
    const { key, dir } = sort
    arr.sort((a:any,b:any)=>{
      const av = a?.[key] ?? ''
      const bv = b?.[key] ?? ''
      if (typeof av === 'number' && typeof bv==='number') return dir==='asc'? av-bv : bv-av
      return dir==='asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
    })
    return arr
  }, [data, sort])

  const start = (page-1)*perPage
  const pageItems = sorted.slice(start, start+perPage)
  const pageCount = Math.max(1, Math.ceil((total || data.length)/perPage))

  const toggleAll = (checked:boolean)=>{
    setSelected(checked ? pageItems.map(d=>d.id) : [])
  }

  const handleToggle = async (driver: DriverRow)=>{
    const newVal = !driver.is_active
    try {
      await toggleMutation.mutateAsync({ id: driver.id, active: newVal })
      toast.success(`Driver ${newVal? 'activated':'deactivated'}`)
      onChanged?.()
    } catch (e:any) {
      toast.error(e?.message || 'Failed to toggle status')
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={selected.length===pageItems.length && pageItems.length>0} onCheckedChange={(v)=>toggleAll(Boolean(v))} aria-label="Select all" />
              </TableHead>
              <SortableHead label="Driver" active={sort.key==='name'} dir={sort.dir} onClick={()=>setSort({ key:'name', dir: sort.key==='name' && sort.dir==='asc'?'desc':'asc' })} />
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <SortableHead label="Orders" active={sort.key==='orders_count'} dir={sort.dir} onClick={()=>setSort({ key:'orders_count', dir: sort.key==='orders_count' && sort.dir==='asc'?'desc':'asc' })} />
              <TableHead>Earnings (wk)</TableHead>
              <TableHead>Status</TableHead>
              <SortableHead label="Joined" active={sort.key==='created_at'} dir={sort.dir} onClick={()=>setSort({ key:'created_at', dir: sort.key==='created_at' && sort.dir==='asc'?'desc':'asc' })} />
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">Loading drivers…</TableCell></TableRow>
            ) : pageItems.length===0 ? (
              <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No drivers found</TableCell></TableRow>
            ) : (
              pageItems.map((d)=> (
                <TableRow key={d.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Checkbox checked={selected.includes(d.id)} onCheckedChange={(v)=>{
                      setSelected(prev=> v ? [...prev, d.id] : prev.filter(id=>id!==d.id))
                    }} aria-label={`Select ${d.name}`} />
                  </TableCell>
                  <TableCell className="min-w-[220px]">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={d.avatar_url||''} />
                        <AvatarFallback>{(d.name||d.email||'?').slice(0,2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium leading-none">{d.name||'Unnamed'}</div>
                        <div className="mt-1 text-xs text-muted-foreground capitalize">{d.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{d.email}</TableCell>
                  <TableCell className="text-sm">{d.phone||'-'}</TableCell>
                  <TableCell>{d.orders_count ?? 0}</TableCell>
                  <TableCell>${(d.earnings_this_week ?? 0).toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch checked={d.is_active} onCheckedChange={()=>handleToggle(d)} aria-label={`Toggle status for ${d.name}`} />
                      <Badge variant={d.is_active? 'default':'secondary'}>{d.is_active?'Active':'Inactive'}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.created_at ? new Date(d.created_at).toLocaleDateString('en-US') : '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" aria-label="Actions"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={()=>setDetailId(d.id)}>View details</DropdownMenuItem>
                        <DropdownMenuItem onClick={()=>setEditId(d.id)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={()=>setRoleId(d.id)}>Change role</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={()=>setDeleteId(d.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">Page {page} of {pageCount}</div>
        <div className="flex items-center gap-2">
          <select className="rounded border bg-background p-1 text-sm" value={perPage} onChange={(e)=>onPerPageChange(Number(e.target.value))}>
            {[10,20,30,50].map(n=> <option key={n} value={n}>{n} / page</option>)}
          </select>
          <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>onPageChange(page-1)}>Previous</Button>
          <Button size="sm" variant="outline" disabled={page>=pageCount} onClick={()=>onPageChange(page+1)}>Next</Button>
        </div>
      </div>

      {/* Modals */}
      {detailId && (
        <DriverDetailModal id={detailId} open={!!detailId} onOpenChange={(o)=>{ if(!o) setDetailId(null) }} />
      )}
      {editId && (
        <EditDriverModal id={editId} open={!!editId} onOpenChange={(o)=>{ if(!o) setEditId(null) }} onUpdated={onChanged} />
      )}
      {roleId && (
        <ChangeRoleDialog id={roleId} open={!!roleId} onOpenChange={(o)=>{ if(!o) setRoleId(null) }} onChanged={onChanged} />
      )}
      {deleteId && (
        <DeleteDriverDialog id={deleteId} open={!!deleteId} onOpenChange={(o)=>{ if(!o) setDeleteId(null) }} onDeleted={onChanged} />
      )}
    </div>
  )
}

function SortableHead({ label, active, dir, onClick }: { label: string; active?: boolean; dir?: 'asc'|'desc'; onClick?: ()=>void }) {
  return (
    <TableHead>
      <button className={`inline-flex items-center gap-1 ${active? 'font-medium':''}`} onClick={onClick}>
        {label}
        <ArrowUpDown className={`h-3.5 w-3.5 ${active? 'opacity-100':'opacity-40'}`} />
      </button>
    </TableHead>
  )
}
