'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Invalid email or password')
        return
      }

      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4" style={{ background: '#F0EDE8' }}>
      {/* Bauhaus Geometric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Large red circle */}
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#E63946]/[0.07]" />
        {/* Blue square rotated */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-[#1D3557]/[0.06]" style={{ transform: 'rotate(45deg)' }} />
        {/* Yellow circle */}
        <div className="absolute top-1/4 right-1/4 w-24 h-24 rounded-full bg-[#F4A261]/[0.08]" />
        {/* Small green square */}
        <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-[#2A9D8F]/[0.06]" style={{ transform: 'rotate(30deg)' }} />
        {/* Thin red line */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-[#E63946]/[0.06]" />
        {/* Blue accent bar */}
        <div className="absolute bottom-0 right-1/3 w-1/2 h-px bg-[#1D3557]/[0.06]" />
      </div>

      {/* Login Card */}
      <div
        className="relative w-full max-w-md rounded-3xl p-8 z-10"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.7)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)',
        }}
      >
        {/* Bauhaus accent bar on card */}
        <div className="absolute top-0 left-8 w-12 h-1 bg-[#E63946] rounded-b-full" />
        <div className="absolute top-0 left-24 w-6 h-1 bg-[#F4A261] rounded-b-full" />
        <div className="absolute top-0 left-34 w-4 h-1 bg-[#1D3557] rounded-b-full" />

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E63946] flex items-center justify-center shadow-[0_4px_16px_rgba(230,57,70,0.35)]">
              <span className="text-white font-black text-xl">V</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1D3557] tracking-tight leading-none">
                Apotik<span className="text-[#E63946]">-V</span>
              </h1>
              <p className="text-[0.65rem] font-bold text-[#6B7280] uppercase tracking-[0.15em] mt-0.5">
                Pharmacy Management
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-xs font-semibold text-[#E63946]">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-[#1D3557] uppercase tracking-wider">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••"
              {...register('password')}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-xs font-semibold text-[#E63946]">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full h-11 text-base font-bold" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Bauhaus geometric footer decoration */}
        <div className="flex items-center justify-center gap-1.5 mt-6 pt-5 border-t border-white/50">
          <div className="w-3 h-3 rounded-full bg-[#E63946]" />
          <div className="w-3 h-3 bg-[#1D3557]" style={{ transform: 'rotate(45deg)' }} />
          <div className="w-3 h-3 rounded-full bg-[#F4A261]" />
        </div>
      </div>
    </div>
  )
}
