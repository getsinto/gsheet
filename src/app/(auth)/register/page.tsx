"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { registerSchema, type RegisterInput } from '@/lib/validations/schemas'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

function formatPhone(v: string) {
  const digits = v.replace(/\D/g, '').slice(0, 10)
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean)
  if (parts.length <= 1) return parts[0] ?? ''
  if (parts.length === 2) return `(${parts[0]}) ${parts[1]}`
  return `(${parts[0]}) ${parts[1]}-${parts[2]}`
}

export default function RegisterPage() {
  const { signUp } = useAuth()
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)
  const { handleSubmit, register, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })
  const password = watch('password') || ''
  const strength = useMemo(() => {
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[a-z]/.test(password)) s++
    if (/\d/.test(password)) s++
    return s
  }, [password])

  const onSubmit = async (values: RegisterInput) => {
    await signUp(values.email, values.password, values.full_name, values.phone)
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input id="full_name" placeholder="John Doe" {...register('full_name')} />
            {errors.full_name && <p className="text-sm text-red-600">{errors.full_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="(555) 555-5555"
              {...register('phone')}
              onChange={(e) => setValue('phone', formatPhone(e.target.value))}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={show ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm" onClick={() => setShow((s) => !s)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="h-2 rounded bg-gray-200 dark:bg-gray-800">
              <div className={`h-2 rounded ${strength >= 3 ? 'bg-green-500' : strength === 2 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${(strength / 4) * 100}%` }} />
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm Password</Label>
            <div className="relative">
              <Input id="confirm_password" type={show2 ? 'text' : 'password'} placeholder="••••••••" {...register('confirm_password')} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm" onClick={() => setShow2((s) => !s)}>
                {show2 ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirm_password && <p className="text-sm text-red-600">{errors.confirm_password.message}</p>}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" required className="h-4 w-4" /> I agree to the Terms
          </label>
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
        </form>
        <p className="text-sm text-muted-foreground">Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link></p>
      </Card>
    </div>
  )
}
