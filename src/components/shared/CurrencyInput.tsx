"use client"

import React from "react"
import { Input } from "@/components/ui/input"

export type CurrencyInputProps = {
  value?: number | string
  onChange?: (val: number) => void
  className?: string
}

export function CurrencyInput({ value, onChange, className = "" }: CurrencyInputProps) {
  const display = formatCurrencyDisplay(value)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, "")
    // allow only one dot
    const norm = raw.replace(/(\..*)\./g, "$1")
    const num = Number(norm || 0)
    onChange?.(Number.isFinite(num) ? Math.max(0, Number(num.toFixed(2))) : 0)
  }

  return (
    <Input inputMode="decimal" value={display} onChange={handle} className={className} />
  )
}

function formatCurrencyDisplay(v: any) {
  const n = typeof v === 'string' ? Number(v) : (v ?? 0)
  if (!Number.isFinite(n)) return "$0.00"
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
}
