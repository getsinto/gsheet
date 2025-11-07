"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { toast } from "react-hot-toast"

export function UploadPhoto({ orderId, onUploaded }: { orderId: string; onUploaded?: ()=>void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onPick = ()=> fileRef.current?.click()

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>)=>{
    const file = e.target.files?.[0]
    if (!file) return
    if (!/\.(jpe?g|png|heic)$/i.test(file.name)) { toast.error('Use JPG, PNG, or HEIC'); return }
    if (file.size > 8*1024*1024) { toast.error('Max 8MB'); return }
    try {
      setUploading(true); setProgress(10)
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch(`/api/orders/${orderId}/photos`, { method:'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Upload failed')
      setProgress(100)
      toast.success('Photo uploaded')
      onUploaded?.()
    } catch (e:any) { toast.error(e?.message || 'Upload failed') } finally {
      setUploading(false); setProgress(0); if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
      <Button type="button" onClick={onPick} disabled={uploading} className="h-12 w-full">{uploading? 'Uploading…' : 'Upload Photo'}</Button>
      {uploading && <div className="mt-2"><Progress value={progress} /></div>}
    </div>
  )
}
