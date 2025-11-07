"use client"

import React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateOrderModal } from "@/components/orders/CreateOrderModal"

export default function NewOrderPage() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="mx-auto max-w-4xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">New Order</h1>
        <Link href="/admin/orders" className="inline-flex"><Button variant="outline">Back to Orders</Button></Link>
      </div>
      <Card className="p-4">
        <p className="mb-3 text-sm text-muted-foreground">Fill in the form to create a new order.</p>
        {/* Inline fallback CTA in case modal is closed */}
        {!open && (
          <Button onClick={()=>setOpen(true)}>Open Create Order Form</Button>
        )}
      </Card>
      <CreateOrderModal open={open} onOpenChange={setOpen} onCreated={()=>{ /* no-op, user can navigate back */ }} />
    </div>
  )
}