"use client"

import * as React from "react"

type SwitchProps = {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
} & Omit<React.ComponentProps<'input'>, 'onChange' | 'type'>

export function Switch({ checked, defaultChecked, onCheckedChange, ...props }: SwitchProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      <span className="h-5 w-9 rounded-full bg-muted transition peer-checked:bg-primary/80" />
      <span className="-ml-8 h-4 w-4 translate-x-0 rounded-full bg-background ring-1 ring-border transition peer-checked:translate-x-4" />
    </label>
  )
}