"use client"

import { useEffect, useMemo, useState } from "react"

export function useOrderFilters() {
  const [values, setValues] = useState<{
    search: string
    status: ("dispatched"|"loaded"|"notified"|"delayed"|"cancelled"|"delivered")[]
    driver_id?: string
    week_number?: 1|2
    start_date?: string
    end_date?: string
  }>({ search: "", status: [] })

  const [drivers, setDrivers] = useState<{id:string, full_name:string}[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // load drivers (unwrap JSON envelope if present)
    fetch('/api/drivers')
      .then(r=>r.json())
      .then((j)=> setDrivers((j && j.data) ? j.data : (Array.isArray(j) ? j : [])))
      .catch(()=>{})
  }, [])

  const setSearch = (s: string) => setValues(v => ({ ...v, search: s }))
  const toggleStatus = (s: any) => setValues(v => ({ ...v, status: v.status.includes(s) ? v.status.filter(x=>x!==s) as any : [...v.status, s] as any }))
  const setDriverId = (id?: string) => setValues(v => ({ ...v, driver_id: id }))
  const setWeek = (wk?: 1|2) => setValues(v => ({ ...v, week_number: wk }))
  const setStartDate = (d?: string) => setValues(v => ({ ...v, start_date: d }))
  const setEndDate = (d?: string) => setValues(v => ({ ...v, end_date: d }))

  const activeFilters = useMemo(() => {
    const list: { key: keyof typeof values; value: any; label: string }[] = []
    if (values.search) list.push({ key: 'search', value: values.search, label: `Search: ${values.search}` })
    if (values.status.length) list.push({ key: 'status', value: values.status, label: `Status: ${values.status.join(', ')}` })
    if (values.driver_id) list.push({ key: 'driver_id', value: values.driver_id, label: 'Driver: selected' })
    if (values.week_number) list.push({ key: 'week_number', value: values.week_number, label: `Week ${values.week_number}` })
    if (values.start_date || values.end_date) list.push({ key: 'start_date', value: values.start_date, label: `Date: ${values.start_date ?? ''} - ${values.end_date ?? ''}` })
    return list
  }, [values])

  const removeFilter = (key: keyof typeof values) => {
    if (key === 'status') setValues(v => ({ ...v, status: [] }))
    else setValues(v => ({ ...v, [key]: undefined, ...(key==='search'?{search:""}:{}) }))
  }

  const reset = () => setValues({ search: "", status: [] })

  const clearSelection = () => setSelectedIds(new Set())
  const toggleSelected = (id: string) => setSelectedIds(prev => { const s = new Set(prev); s.has(id)?s.delete(id):s.add(id); return s })

  const queryParams = useMemo(() => {
    const q = new URLSearchParams()
    if (values.search) q.set('search', values.search)
    if (values.status.length) q.set('status', values.status.join(','))
    if (values.driver_id) q.set('driver_id', values.driver_id)
    if (values.week_number) q.set('week_number', String(values.week_number))
    if (values.start_date) q.set('start_date', values.start_date)
    if (values.end_date) q.set('end_date', values.end_date)
    return q
  }, [values])

  return {
    values,
    drivers,
    setSearch,
    toggleStatus,
    setDriverId,
    setWeek,
    setStartDate,
    setEndDate,
    activeFilters,
    removeFilter,
    reset,
    selectedIds,
    toggleSelected,
    clearSelection,
    queryParams,
  }
}
