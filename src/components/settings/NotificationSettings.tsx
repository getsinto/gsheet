"use client"

import React from "react"
import { useFormContext } from "react-hook-form"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { SettingsForm } from "@/app/(dashboard)/admin/settings/page"

export function NotificationSettings() {
  const { register, watch } = useFormContext<SettingsForm>()
  const emailOn = watch('email_notifications_enabled')
  const smsOn = watch('sms_enabled')

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Enable in-app notifications</Label>
          <Switch {...register('notifications_enabled')} />
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex items-center gap-2 text-sm"><Checkbox {...register('notification_events.order_assigned')} /> Order assigned to you</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox {...register('notification_events.status_changed')} /> Order status changed</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox {...register('notification_events.new_order_created')} /> New order created (admins)</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox {...register('notification_events.order_delayed')} /> Order delayed (admins)</label>
          <label className="flex items-center gap-2 text-sm"><Checkbox {...register('notification_events.week_rotation')} /> Week rotation</label>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Enable email notifications</Label>
          <Switch {...register('email_notifications_enabled')} />
        </div>
        {emailOn && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="email_address">Email address</Label>
              <Input id="email_address" type="email" placeholder="you@example.com" {...register('email_address')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email_digest_frequency">Digest frequency</Label>
              <select id="email_digest_frequency" className="w-full rounded border bg-background p-2 text-sm" {...register('email_digest_frequency')}>
                <option value="real_time">Real-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
              <label className="flex items-center gap-2 text-sm"><Checkbox {...register('email_notification_events.order_assigned')} /> Order assigned to you</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox {...register('email_notification_events.status_changed')} /> Order status changed</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox {...register('email_notification_events.new_order_created')} /> New order created (admins)</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox {...register('email_notification_events.order_delayed')} /> Order delayed (admins)</label>
              <label className="flex items-center gap-2 text-sm"><Checkbox {...register('email_notification_events.week_rotation')} /> Week rotation</label>
            </div>
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Enable SMS notifications</Label>
          <Switch {...register('sms_enabled')} />
        </div>
        {smsOn && (
          <div className="space-y-1">
            <Label htmlFor="sms_phone">Phone number</Label>
            <Input id="sms_phone" placeholder="(555) 987-6543" {...register('sms_phone')} />
          </div>
        )}
      </div>
    </div>
  )
}
