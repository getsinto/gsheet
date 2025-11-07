"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { loginSchema, type LoginInput } from '@/lib/validations/schemas'
import { useAuth } from '@/lib/hooks/useAuth'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function LoginPage() {
  const { signIn } = useAuth()
  const [show, setShow] = useState(false)
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginInput) => {
    await signIn(values.email, values.password)
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input id="password" type={show ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-sm" onClick={() => setShow((s) => !s)}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4" /> Remember me
            </label>
            <Link href="/forgot-password" className="text-blue-600 hover:underline">Forgot password?</Link>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Signing in…' : 'Sign in'}</Button>
        </form>
        <p className="text-sm text-muted-foreground">Don't have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link></p>
      </Card>
    </div>
  )
}
