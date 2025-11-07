"use client"

import React from "react"

export function DeliveryMap({ address }: { address?: string }) {
  if (!address) return null
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
  return (
    <div className="overflow-hidden rounded border">
      <iframe title="Delivery map" src={src} width="100%" height="200" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="p-2 text-right text-xs"><a className="text-primary underline" target="_blank" href={directions}>Open in Google Maps</a></div>
    </div>
  )
}
