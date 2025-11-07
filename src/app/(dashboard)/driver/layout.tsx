"use client"

import React from "react"
import { DriverRoute } from "@/components/auth/routes"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Calendar, HelpCircle, Home, LogOut, Menu, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/useAuth"
import { DriverNotifications } from "@/components/driver/DriverNotifications"

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <DriverRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-4 pb-20 pt-16 sm:pt-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </DriverRoute>
  )
}

function Header() {
  const { user } = useAuth()
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <MobileNav />
        <div className="text-base font-semibold sm:text-lg">My Deliveries</div>
        <div className="flex items-center gap-2">
          <DriverNotifications />
          <Link href="/app/(dashboard)/driver/profile" className="inline-flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar_url || ""} />
              <AvatarFallback>{(user?.email||"?").slice(0,2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  )
}

function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open menu" className="h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <nav className="mt-4 grid gap-1">
          <NavLink href="/app/(dashboard)/driver" icon={<Home className="h-5 w-5" />}>My Orders</NavLink>
          <NavLink href="/app/(dashboard)/driver/today" icon={<Calendar className="h-5 w-5" />}>Today's Deliveries</NavLink>
          <NavLink href="/app/(dashboard)/driver/profile" icon={<UserIcon className="h-5 w-5" />}>Profile</NavLink>
          <NavLink href="/help" icon={<HelpCircle className="h-5 w-5" />}>Help</NavLink>
          <NavLink href="/logout" icon={<LogOut className="h-5 w-5" />}>Logout</NavLink>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent">
      {icon}
      <span>{children}</span>
    </Link>
  )
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur sm:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-4 text-xs">
        <BottomItem href="/app/(dashboard)/driver" label="Orders" icon={<Home className="h-5 w-5" />} />
        <BottomItem href="/app/(dashboard)/driver/today" label="Today" icon={<Calendar className="h-5 w-5" />} />
        <BottomItem href="/app/(dashboard)/driver/profile" label="Profile" icon={<UserIcon className="h-5 w-5" />} />
        <BottomItem href="/logout" label="Logout" icon={<LogOut className="h-5 w-5" />} />
      </div>
    </nav>
  )
}

function BottomItem({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex flex-col items-center justify-center gap-1 py-2">
      {icon}
      <span>{label}</span>
    </Link>
  )
}
