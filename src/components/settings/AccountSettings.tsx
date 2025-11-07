"use client"

import React, { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/hooks/useAuth"
import { updatePassword } from "@/lib/supabase/auth"
import { toast } from "react-hot-toast"
import { SettingsForm } from "@/app/(dashboard)/admin/settings/page"

export function AccountSettings() {
  const { user } = useAuth()
  const { register, setValue } = useFormContext<SettingsForm>()
  const [pwd, setPwd] = useState({ current:'', next:'', confirm:'' })
  const [loading, setLoading] = useState(false)

  const onAvatarSelected = async (file?: File)=>{
    if (!file) return
    if (file.size > 2*1024*1024) { toast.error('Max 2MB'); return }
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/profile/avatar', { method:'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.message || 'Upload failed')
      const url = json.url || json.secure_url
      setValue('avatar_url', url, { shouldDirty: true })
      toast.success('Avatar updated')
    } catch (e:any) { toast.error(e?.message || 'Failed to upload') }
  }

  const onUpdatePassword = async ()=>{
    if (!pwd.next || pwd.next!==pwd.confirm) { toast.error('Passwords do not match'); return }
    try { setLoading(true); await updatePassword(pwd.next); toast.success('Password updated') } catch (e:any) { toast.error(e?.message || 'Failed to update password') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="profile_name">Name</Label>
            <Input id="profile_name" defaultValue={user?.user_metadata?.name || ''} {...register('profile_name')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ''} readOnly />
            <div className="text-xs text-muted-foreground">Email changes require admin assistance.</div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="profile_phone">Phone</Label>
            <Input id="profile_phone" defaultValue={user?.user_metadata?.phone || ''} {...register('profile_phone')} />
          </div>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Avatar</Label>
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-full border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user?.user_metadata?.avatar_url || '/avatar.png'} className="h-full w-full object-cover" alt="avatar" />
              </div>
              <div>
                <input id="avatar_input" className="hidden" type="file" accept="image/*" onChange={(e)=>onAvatarSelected(e.target.files?.[0])} />
                <Button type="button" variant="outline" onClick={()=>document.getElementById('avatar_input')?.click()}>Upload</Button>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Change Password</Label>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <Input type="password" placeholder="Current" value={pwd.current} onChange={(e)=>setPwd(s=>({...s,current:e.target.value}))} />
              <Input type="password" placeholder="New" value={pwd.next} onChange={(e)=>setPwd(s=>({...s,next:e.target.value}))} />
              <Input type="password" placeholder="Confirm" value={pwd.confirm} onChange={(e)=>setPwd(s=>({...s,confirm:e.target.value}))} />
            </div>
            <div className="pt-2"><Button size="sm" onClick={onUpdatePassword} disabled={loading}>{loading? 'Updating…':'Update Password'}</Button></div>
          </div>
        </div>
      </div>

      <div className="rounded border border-red-300 p-4">
        <div className="mb-2 font-medium text-red-600">Danger Zone</div>
        <DangerDeleteAccount />
      </div>
    </div>
  )
}

function DangerDeleteAccount() {
  const [confirm, setConfirm] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onDelete = async ()=>{
    try {
      setLoading(true)
      if (confirm.length === 0) throw new Error('Type your username to confirm')
      // This would call a secured admin-only route in a real app
      const res = await fetch('/api/profile', { method:'DELETE', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ confirm, admin_password: password }) })
      if (!res.ok) throw new Error(await res.text())
      window.location.href = '/logout'
    } catch (e:any) { alert(e?.message || 'Failed to delete account') } finally { setLoading(false) }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground">Delete your account. Requires admin password and cannot be undone.</div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <Input placeholder="Type your username" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
        <Input type="password" placeholder="Admin password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <Button variant="destructive" disabled={loading || !confirm || !password} onClick={onDelete}>{loading? 'Deleting…':'Delete Account'}</Button>
      </div>
    </div>
  )
}
