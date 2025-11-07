"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { GeneralSettings } from "@/components/settings/GeneralSettings"
import { OrdersSettings } from "@/components/settings/OrdersSettings"
import { NotificationSettings } from "@/components/settings/NotificationSettings"
import { WeekManagementSettings } from "@/components/settings/WeekManagementSettings"
import { DataExportSettings } from "@/components/settings/DataExportSettings"
import { AppearanceSettings } from "@/components/settings/AppearanceSettings"
import { AccountSettings } from "@/components/settings/AccountSettings"
import { PodiumTemplateSettings } from "@/components/settings/PodiumTemplateSettings"
import { useSettings, useUpdateSettings } from "@/lib/hooks/useSettings"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Bell, Calendar, ClipboardList, Database, Palette, Settings as SettingsIcon, User } from "lucide-react"
import { toast } from "react-hot-toast"

const SettingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').optional().or(z.literal('')),
  company_phone: z.string().optional(),
  company_address: z.string().optional(),
  company_logo_url: z.string().url().optional().or(z.literal('')),
  time_zone: z.string().default('America/Chicago'),
  date_format: z.enum(["MM/DD/YYYY","DD/MM/YYYY","YYYY-MM-DD"]).default("MM/DD/YYYY"),
  currency: z.string().default("USD"),
  distance_unit: z.enum(["miles","kilometers"]).default("miles"),

  default_pay_rate: z.number().min(0).default(0),
  auto_generate_order_numbers: z.boolean().default(true),
  order_number_prefix: z.string().default("ON"),
  order_number_start: z.number().min(1).default(1),
  container_types: z.array(z.string()).default([]),
  markets: z.array(z.string()).default([]),
  auto_lock_delivered: z.boolean().default(true),
  default_notes_template: z.string().optional().default(''),
  drivers_can_edit_orders: z.boolean().default(false),
  require_photos_before_delivery: z.boolean().default(false),

  notifications_enabled: z.boolean().default(true),
  notification_events: z.object({
    order_assigned: z.boolean().default(true),
    status_changed: z.boolean().default(true),
    new_order_created: z.boolean().default(true),
    order_delayed: z.boolean().default(false),
    week_rotation: z.boolean().default(true),
  }).default({ order_assigned:true, status_changed:true, new_order_created:true, order_delayed:false, week_rotation:true }),

  email_notifications_enabled: z.boolean().default(false),
  email_address: z.string().email().optional().or(z.literal('')),
  email_digest_frequency: z.enum(['real_time','daily','weekly']).default('real_time'),
  email_notification_events: z.any().optional(),

  sms_enabled: z.boolean().default(false),
  sms_phone: z.string().optional(),

  current_week: z.number().min(1).max(2).default(1),
  week_start: z.enum(['sunday','monday']).default('monday'),
  auto_rotate_weeks: z.boolean().default(false),
  auto_rotate_schedule: z.enum(['weekly','bi_weekly','monthly']).default('weekly'),
  archive_retention_days: z.number().min(1).default(90),

  theme: z.enum(['system','light','dark']).default('system'),
  status_colors: z.record(z.string(), z.string()).default({}),
  font_size: z.enum(['sm','md','lg']).default('md'),
  compact_mode: z.boolean().default(false),

  // account page writes to profile endpoints mostly; keep minimal mirror for convenience
  profile_name: z.string().optional(),
  profile_phone: z.string().optional(),
  avatar_url: z.string().optional(),
})

export type SettingsForm = z.infer<typeof SettingsSchema>

export default function SettingsPage() {
  const { data: settings, isLoading, refetch } = useSettings()
  const update = useUpdateSettings()

  const methods = useForm<SettingsForm>({
    // Zod v4 types can be stricter than RHF generics; cast resolver to satisfy TS
    resolver: zodResolver(SettingsSchema) as any,
    mode: 'onChange',
    defaultValues: (settings || {}) as any,
  })

  useEffect(()=>{
    if (settings) methods.reset(settings as any)
  }, [settings])

  const [saving, setSaving] = useState(false)
  const formValues = methods.watch()
  const initialValuesRef = useRef<SettingsForm | null>(null)
  useEffect(()=>{ if (settings && !initialValuesRef.current) initialValuesRef.current = settings as any }, [settings])

  const dirty = useMemo(()=> JSON.stringify(formValues) !== JSON.stringify(initialValuesRef.current||{}), [formValues])

  const onSave = methods.handleSubmit(async (values)=>{
    try {
      setSaving(true)
      const diff: Record<string, any> = {}
      const initial = initialValuesRef.current || {}
      Object.keys(values).forEach((k)=>{
        const key = k as keyof SettingsForm
        const a = (values as any)[key]
        const b = (initial as any)[key]
        if (JSON.stringify(a) !== JSON.stringify(b)) diff[key] = a
      })
      if (Object.keys(diff).length===0) { toast.success('No changes to save'); return }
      await update.mutateAsync(diff)
      toast.success('Settings saved')
      await refetch()
      initialValuesRef.current = { ...(initialValuesRef.current||{}), ...diff } as any
    } catch (e:any) {
      toast.error(e?.message || 'Failed to save settings')
    } finally { setSaving(false) }
  })

  const sections = [
    { id:'general', title:'General', icon: <SettingsIcon className="h-4 w-4" /> },
    { id:'orders', title:'Orders', icon: <ClipboardList className="h-4 w-4" /> },
    { id:'podium', title:'Podium Template', icon: <ClipboardList className="h-4 w-4" /> },
    { id:'notifications', title:'Notifications', icon: <Bell className="h-4 w-4" /> },
    { id:'week', title:'Week Management', icon: <Calendar className="h-4 w-4" /> },
    { id:'data', title:'Data & Export', icon: <Database className="h-4 w-4" /> },
    { id:'appearance', title:'Appearance', icon: <Palette className="h-4 w-4" /> },
    { id:'account', title:'Account', icon: <User className="h-4 w-4" /> },
  ]

  return (
    <FormProvider {...methods}>
      <div className="relative">
        {/* Sticky Save */}
        <div className="sticky top-0 z-20 -mx-4 mb-4 flex items-center justify-end bg-background/80 p-4 backdrop-blur md:-mx-8">
          <Button onClick={onSave} disabled={!dirty || saving}>{saving? 'Saving…' : 'Save Changes'}</Button>
        </div>

        {isLoading && !settings ? (
          <div className="space-y-4">
            <div className="h-8 w-40 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {Array.from({length:7}).map((_,i)=> <Card key={i} className="h-32 animate-pulse" />)}
            </div>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Sidebar */}
          <nav className="md:col-span-1">
            <Card className="p-2">
              <ul className="space-y-1">
                {sections.map(s=> (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-muted aria-[current]:bg-muted" aria-current={undefined}>
                      {s.icon}<span>{s.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          </nav>

          {/* Content */}
          <div className="md:col-span-3 space-y-8">
            <section id="general" className="scroll-mt-20">
              <SectionHeader title="General" subtitle="Company info, time zone, and regional settings" />
              <Card className="p-4">
                <GeneralSettings />
              </Card>
            </section>

            <section id="orders" className="scroll-mt-20">
              <SectionHeader title="Orders" subtitle="Defaults, container types, markets, and behavior" />
              <Card className="p-4">
                <OrdersSettings />
              </Card>
            </section>

            <section id="podium" className="scroll-mt-20">
              <SectionHeader title="Podium Message Template" subtitle="Define the message template and variables" />
              <Card className="p-4">
                <PodiumTemplateSettings />
              </Card>
            </section>

            <section id="notifications" className="scroll-mt-20">
              <SectionHeader title="Notifications" subtitle="Configure in-app, email, and SMS notifications" />
              <Card className="p-4">
                <NotificationSettings />
              </Card>
            </section>

            <section id="week" className="scroll-mt-20">
              <SectionHeader title="Week Management" subtitle="Rotate weeks, archives, and scheduling" />
              <Card className="p-4">
                <WeekManagementSettings />
              </Card>
            </section>

            <section id="data" className="scroll-mt-20">
              <SectionHeader title="Data & Export" subtitle="Import/export and backups" />
              <Card className="p-4">
                <DataExportSettings />
              </Card>
            </section>

            <section id="appearance" className="scroll-mt-20">
              <SectionHeader title="Appearance" subtitle="Theme, colors, and typography" />
              <Card className="p-4">
                <AppearanceSettings />
              </Card>
            </section>

            <section id="account" className="scroll-mt-20">
              <SectionHeader title="Account" subtitle="Profile, password, and security" />
              <Card className="p-4">
                <AccountSettings />
              </Card>
            </section>
          </div>
        </div>
        )}
      </div>
    </FormProvider>
  )
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
    </div>
  )
}
