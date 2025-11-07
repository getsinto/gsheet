"use client"

import React, { useCallback, useMemo, useState } from "react"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export type FileUploadProps = {
  onUpload: (files: File[]) => Promise<void> | void
  accept?: string[]
  maxSize?: number // bytes
  multiple?: boolean
  className?: string
}

export function FileUpload({ onUpload, accept, maxSize = 10*1024*1024, multiple = true, className = "" }: FileUploadProps) {
  const [drag, setDrag] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)

  const acceptSet = useMemo(()=> new Set((accept||[]).map(a=>a.toLowerCase())), [accept])

  const validate = (files: File[])=>{
    for (const f of files) {
      if (acceptSet.size>0) {
        const ext = `.${f.name.split('.').pop()?.toLowerCase()}`
        if (!acceptSet.has(f.type.toLowerCase()) && !acceptSet.has(ext)) return `Invalid file type: ${f.name}`
      }
      if (f.size > maxSize) return `File too large: ${f.name}`
    }
    return null
  }

  const handleFiles = async (files: FileList | null)=>{
    if (!files || files.length===0) return
    const list = Array.from(files)
    const err = validate(list)
    if (err) { setError(err); return }
    setError(null)
    setBusy(true); setProgress(10)
    try {
      await onUpload(list)
      setProgress(100)
    } finally {
      setBusy(false); setTimeout(()=>setProgress(0), 500)
    }
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>)=>{
    e.preventDefault(); e.stopPropagation(); setDrag(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed p-6 text-center ${drag? 'bg-muted/40':''} ${className}`}
      onDragOver={(e)=>{ e.preventDefault(); setDrag(true) }}
      onDragLeave={()=>setDrag(false)}
      onDrop={onDrop}
      onClick={()=>{
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = multiple
        if (accept && accept.length>0) input.accept = accept.join(',')
        input.onchange = ()=> handleFiles(input.files)
        input.click()
      }}
    >
      <Upload className="h-6 w-6 text-muted-foreground" />
      <div className="text-sm">Drag and drop files here, or click to browse</div>
      {accept && <div className="text-xs text-muted-foreground">Accepted: {accept.join(', ')}</div>}
      {error && <div className="text-xs text-red-600">{error}</div>}
      {busy && <div className="mt-2 w-full max-w-xs"><Progress value={progress} /></div>}
    </div>
  )
}
