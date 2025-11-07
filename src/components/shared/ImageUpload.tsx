"use client"

import React, { useState } from "react"
import { FileUpload } from "./FileUpload"

export type ImageUploadProps = {
  onUpload: (files: File[]) => Promise<void> | void
  maxSize?: number
  multiple?: boolean
  className?: string
}

export function ImageUpload({ onUpload, maxSize = 5*1024*1024, multiple = false, className = "" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)

  const handle = async (files: File[]) => {
    // simple compression via canvas for images
    const processed: File[] = []
    for (const f of files) {
      if (!/^image\//.test(f.type)) continue
      const blob = await compressImage(f, 0.85)
      processed.push(new File([blob], f.name, { type: blob.type }))
      if (!multiple && !preview) setPreview(URL.createObjectURL(blob))
    }
    await onUpload(processed)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Preview" className="h-24 w-24 rounded object-cover" />
      )}
      <FileUpload onUpload={handle} accept={["image/jpeg","image/png","image/webp",".jpg",".jpeg",".png",".webp"]} maxSize={maxSize} multiple={multiple} />
    </div>
  )
}

async function compressImage(file: File, quality = 0.8): Promise<Blob> {
  const img = document.createElement('img')
  img.src = URL.createObjectURL(file)
  await new Promise(res=> { img.onload = res })
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const maxW = 1600
  const scale = Math.min(1, maxW / img.width)
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return await new Promise<Blob>((resolve)=> canvas.toBlob(b=> resolve(b!), 'image/jpeg', quality))
}
