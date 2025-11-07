"use client"

import { useForm } from 'react-hook-form'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<{ email: string }>({
    defaultValues: { email: '' }
  })

  const onSubmit = async (values: { email: string }) => {
    const supabase = createBrowserClient()
    const { error } = await supabase.auth.resetPasswordForEmail(values.email)
    if (error) toast.error(error.message)
    else toast.success('If the email exists, a reset link has been sent.')
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Reset your password</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email', { required: true })} />
            {errors.email && <p className="text-sm text-red-600">Email is required</p>}
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? 'Sending…' : 'Send reset link'}</Button>
        </form>
      </Card>
    </div>
  )
}
