"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/FadeIn";
import {
  MapPin,
  Truck,
  Bell,
  Calendar,
  Users,
  Palette,
  Smartphone,
  Plus,
  FileText,
  UserPlus,
  Activity,
  Send,
  Star,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 text-foreground">
      <Navbar />
      <main id="home" className="">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto grid gap-8 px-4 pb-20 pt-16 md:grid-cols-2 md:items-center lg:gap-12 lg:pt-24">
            <FadeIn className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Streamline Your Container Delivery Operations
              </h1>
              <p className="max-w-prose text-lg text-muted-foreground">
                Modern delivery management system designed for efficiency and reliability.
                Track orders in real time, assign drivers, and automate notifications.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-6">
                  <Link href="/login">View Demo</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Demo: driver@example.com / Password: Demo1234
              </p>
            </FadeIn>
            <FadeIn className="relative">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-100 to-emerald-100 blur-2xl" aria-hidden />
                <Image
                  src="/globe.svg"
                  alt="Logistics visualization"
                  width={800}
                  height={600}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="container mx-auto px-4 py-20">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Powerful Features for Your Business</h2>
            <p className="mt-3 text-muted-foreground">Everything you need to run high-velocity delivery operations.</p>
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Real-Time Order Tracking", icon: MapPin, desc: "Track all deliveries in real-time with status updates" },
              { title: "Automated Notifications", icon: Bell, desc: "Automatically send driver notifications with one click" },
              { title: "Smart Scheduling", icon: Calendar, desc: "Manage deliveries with 2-week rotating schedule" },
              { title: "Driver Management", icon: Users, desc: "Assign, track, and manage your driver fleet" },
              { title: "Color-Coded Status", icon: Palette, desc: "Visual status indicators for quick overview" },
              { title: "Mobile Friendly", icon: Smartphone, desc: "Access from any device, anywhere, anytime" },
            ].map(({ title, icon: Icon, desc }) => (
              <FadeIn key={title}>
                <Card className="h-full rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-zinc-900">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-blue-600/10 p-3 text-blue-700 dark:text-blue-300">
                      <Icon className="h-6 w-6" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="bg-white/50 py-20 dark:bg-zinc-950/30">
          <div className="container mx-auto px-4">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, Efficient Workflow</h2>
              <p className="mt-3 text-muted-foreground">From order creation to delivery confirmation.</p>
            </FadeIn>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Create Orders", icon: Plus, desc: "Add new deliveries with all customer and pickup details" },
                { title: "Assign Drivers", icon: UserPlus, desc: "Automatically assign orders to available drivers" },
                { title: "Track Progress", icon: Activity, desc: "Monitor status changes in real-time with color coding" },
                { title: "Send Notifications", icon: Send, desc: "One-click formatted messages ready for Podium" },
              ].map(({ title, icon: Icon, desc }, idx) => (
                <FadeIn key={title}>
                  <Card className="h-full rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-300">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-muted-foreground">Step {idx + 1}</div>
                        <h3 className="text-lg font-semibold">{title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                      </div>
                    </div>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section id="about" className="container mx-auto grid items-center gap-10 px-4 py-20 md:grid-cols-2">
          <FadeIn>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl rounded-2xl border bg-white p-6 shadow-sm dark:bg-zinc-900">
              <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-emerald-100 to-orange-100 blur-2xl" aria-hidden />
              <Image
                src="/window.svg"
                alt="Dashboard preview"
                width={800}
                height={600}
                className="h-full w-full object-contain"
              />
            </div>
          </FadeIn>
          <FadeIn>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Why Choose Strong Containers?</h2>
            <ul className="mt-6 space-y-3 text-muted-foreground">
              {[
                "Save 10+ hours per week on manual data entry",
                "Reduce errors with automated workflows",
                "Improve driver communication",
                "Scale your operations efficiently",
                "Never lose track of a delivery",
                "Professional documentation",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-600" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </section>

        {/* TESTIMONIAL */}
        <section className="container mx-auto px-4 py-10">
          <FadeIn>
            <Card className="mx-auto max-w-3xl rounded-xl border bg-white p-8 shadow-sm dark:bg-zinc-900">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-1 text-amber-500" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg">
                  “We cut scheduling time in half and have complete visibility into every delivery.”
                </blockquote>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">— Alex M., Operations Manager</div>
            </Card>
          </FadeIn>
        </section>

        {/* CTA */}
        <section id="contact" className="bg-gradient-to-r from-blue-600 to-emerald-600 py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <FadeIn>
              <h2 className="text-3xl font-semibold sm:text-4xl">Ready to Transform Your Delivery Operations?</h2>
              <p className="mt-3 text-white/90">Join companies streamlining their logistics with Strong Containers.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 bg-white text-blue-700 hover:bg-white/90">
                  <Link href="/register">Get Started Today</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 border-white text-white hover:bg-white/10">
                  <Link href="mailto:sales@strongcontainers.com">Schedule a Demo</Link>
                </Button>
              </div>
              <div className="mt-6 text-sm">Contact: sales@strongcontainers.com · (555) 555-5555</div>
            </FadeIn>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t bg-white py-10 text-sm dark:bg-zinc-950">
          <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <span className="inline-block h-6 w-6 rounded bg-gradient-to-br from-blue-600 to-emerald-500" aria-hidden />
                Strong Containers Delivery
              </div>
              <p className="mt-3 text-muted-foreground max-w-xs">Professional delivery management built with Next.js and Supabase.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="font-medium">Company</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li><Link href="#home">Home</Link></li>
                  <li><Link href="#features">Features</Link></li>
                  <li><Link href="#how">How it Works</Link></li>
                  <li><Link href="#about">About</Link></li>
                </ul>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Legal</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li><Link href="#">Privacy</Link></li>
                  <li><Link href="#">Terms</Link></li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <div className="font-medium">Contact</div>
              <div className="text-muted-foreground">sales@strongcontainers.com</div>
              <div className="text-muted-foreground">(555) 555-5555</div>
              <div className="pt-2 text-muted-foreground">© 2025 Strong Containers Delivery. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
