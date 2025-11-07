"use client"

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const NavLinks = () => (
    <ul className="flex flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:gap-6 sm:px-0 sm:py-0">
      <li><Link href="#home" className="hover:text-blue-700">Home</Link></li>
      <li><Link href="#features" className="hover:text-blue-700">Features</Link></li>
      <li><Link href="#how" className="hover:text-blue-700">How it Works</Link></li>
      <li><Link href="#about" className="hover:text-blue-700">About</Link></li>
      <li><Link href="#contact" className="hover:text-blue-700">Contact</Link></li>
    </ul>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur dark:bg-zinc-900/70">
      <nav className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link href="#home" className="flex items-center gap-2 text-base font-semibold">
          <span className="inline-block h-8 w-8 rounded bg-gradient-to-br from-blue-600 to-emerald-500" aria-hidden />
          <span>Strong Containers Delivery</span>
        </Link>
        <div className="hidden sm:block">
          <NavLinks />
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="outline" asChild><Link href="/login">Login</Link></Button>
          <Button asChild><Link href="/register">Get Started</Link></Button>
        </div>
        <button aria-label="Toggle menu" className="sm:hidden" onClick={() => setOpen((o) => !o)}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="sm:hidden border-t bg-white/95 dark:bg-zinc-900/95">
          <div className="container mx-auto">
            <NavLinks />
            <div className="flex items-center gap-2 px-4 pb-4">
              <Button variant="outline" asChild className="flex-1"><Link href="/login">Login</Link></Button>
              <Button asChild className="flex-1"><Link href="/register">Get Started</Link></Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
