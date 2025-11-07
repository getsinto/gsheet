"use client"

import React from "react"
import { Input } from "@/components/ui/input"

export type PhoneInputProps = {
  value?: string
  onChange?: (val: string) => void
  error?: string
  placeholder?: string
  className?: string
}

export function PhoneInput({ value = "", onChange, error, placeholder = "(555) 123-4567", className = "" }: PhoneInputProps) {
  const format = (val: string) => {
    const digits = (val || "").replace(/\D+/g, "").slice(0, 10)
    const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)]
    if (digits.length <= 3) return parts[0]
    if (digits.length <= 6) return `(${parts[0]}) ${parts[1]}`
    return `(${parts[0]}) ${parts[1]}-${parts[2]}`
  }
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = format(e.target.value)
    onChange?.(next)
  }
  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain") || ""
    onChange?.(format(text))
  }
  return (
    <div className="w-full">
      <Input value={value} onChange={handle} onPaste={onPaste} placeholder={placeholder} className={className} />
      {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
    </div>
  )
}
