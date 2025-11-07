"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { LoadingSpinner } from "./LoadingSpinner"

export type SearchInputProps = {
  value?: string
  onChange?: (val: string) => void
  placeholder?: string
  debounce?: number
  isLoading?: boolean
  className?: string
}

export function SearchInput({ value = "", onChange, placeholder = "Search...", debounce = 300, isLoading, className = "" }: SearchInputProps) {
  const [local, setLocal] = React.useState(value)
  const timer = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(()=>{ setLocal(value) }, [value])

  const emit = (val: string)=>{
    if (!onChange) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(()=> onChange(val), debounce)
  }

  React.useEffect(()=>{
    const onKey = (e: KeyboardEvent)=>{
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='k') {
        const el = document.getElementById('global-search-input') as HTMLInputElement | null
        el?.focus()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return ()=> window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input id="global-search-input" value={local} onChange={(e)=>{ setLocal(e.target.value); emit(e.target.value) }} placeholder={placeholder} className="pl-8" />
      {isLoading && <div className="absolute right-2 top-1/2 -translate-y-1/2"><LoadingSpinner size="sm" /></div>}
      <button aria-label="Clear" className={`absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground ${local? 'opacity-100':'opacity-0 pointer-events-none'}`} onClick={()=>{ setLocal(''); onChange?.('') }}>×</button>
    </div>
  )
}
