"use client"

import React from "react"
import { useAuth } from "@/lib/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EditProfileModal } from "@/components/driver/EditProfileModal"
import { useDriverStats } from "@/lib/hooks/useDriverOrders"
import Link from "next/link"

export default function DriverProfilePage() {
  const { user } = useAuth()
  const { data: stats } = useDriverStats()
  const [open, setOpen] = React.useState(false)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <button onClick={()=>setOpen(true)} className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.avatar_url || ''} />
              <AvatarFallback>{(user?.email||'?').slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </button>
          <div>
            <div className="text-lg font-semibold">{user?.full_name || 'Driver'}</div>
            <div className="text-sm text-muted-foreground">{user?.email}</div>
            <div className="text-sm text-muted-foreground">{user?.phone || ''}</div>
          </div>
        </div>
        <div className="mt-3"><Button size="sm" variant="outline" onClick={()=>setOpen(true)}>Edit Profile</Button></div>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <StatCard title="Total Deliveries" value={stats?.total_count ?? 0} />
        <StatCard title="This Week" value={stats?.week_count ?? 0} />
        <StatCard title="This Month" value={stats?.month_count ?? 0} />
        <StatCard title="Total Earnings" value={(stats?.total_earnings ?? 0).toLocaleString(undefined,{style:'currency',currency:'USD'})} />
        <StatCard title="Total Miles" value={stats?.total_miles ?? 0} />
        <StatCard title="Avg Rating" value={(stats?.avg_rating ?? 0).toFixed(1)} />
      </div>

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium">Recent Orders</div>
        <div className="space-y-2 text-sm text-muted-foreground">Last 10 completed orders will appear here.</div>
        <div className="pt-2"><Link href="/app/(dashboard)/driver" className="text-primary underline">View all</Link></div>
      </Card>

      <Card className="p-4">
        <div className="mb-2 text-sm font-medium">Account</div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/(dashboard)/driver" className="inline-flex"><Button size="sm" variant="outline">Notification Preferences</Button></Link>
          <Link href="/app/(dashboard)/driver" className="inline-flex"><Button size="sm" variant="outline">Change Password</Button></Link>
          <Link href="/help" className="inline-flex"><Button size="sm" variant="outline">Help & FAQ</Button></Link>
        </div>
      </Card>

      <EditProfileModal open={open} onOpenChange={setOpen} />
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: React.ReactNode }) {
  return (
    <Card className="rounded-xl border p-3 text-center">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </Card>
  )
}
