"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AdminRoute } from "@/components/auth/routes"
import { Bell, Calendar, ClipboardList, Home, Menu, Settings, Users, X } from "lucide-react"
import { NotificationBell } from "@/components/dashboard/NotificationBell"
import { UserMenu } from "@/components/dashboard/UserMenu"
import { useAuth } from "@/lib/hooks/useAuth"

const nav = [
  { href: "/admin", label: "Dashboard", icon: Home },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/schedule", label: "Schedule", icon: Calendar },
  { href: "/admin/drivers", label: "Drivers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()

  const content = (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-zinc-900">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-7 w-7 rounded bg-gradient-to-br from-blue-600 to-emerald-500" aria-hidden />
          Strong
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Close sidebar" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-2">
        {nav.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition hover:bg-blue-50 dark:hover:bg-zinc-800 ${active ? "bg-blue-100 dark:bg-zinc-800 font-medium" : ""}`}>
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar_url ?? ""} alt={user?.full_name ?? "User"} />
            <AvatarFallback>{user?.full_name?.slice(0,2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user?.full_name ?? "User"}</div>
            <Badge variant="secondary" className="mt-0.5 h-5 text-[10px]">{user?.role}</Badge>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r bg-white dark:bg-zinc-900 lg:block">
        {content}
      </aside>
      {/* Mobile/Tablet */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-white dark:bg-zinc-900 shadow-xl">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const section = useMemo(() => {
    const match = nav.find((n) => pathname?.startsWith(n.href))
    return match?.label ?? "Dashboard"
  }, [pathname])

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
        <Sidebar open={open} onClose={() => setOpen(false)} />
        <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-white/80 px-3 backdrop-blur dark:bg-zinc-900/70 lg:pl-64">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open sidebar" onClick={() => setOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold leading-none sm:text-xl" aria-live="polite">{section}</h1>
          </div>
          <div className="flex items-center gap-1 pr-2">
            <NotificationBell />
            <UserMenu />
          </div>
        </header>
        <main className="pt-16 lg:pl-64">
          <div className="container mx-auto max-w-7xl p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </AdminRoute>
  )
}
