'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The verification link may have expired or already been used.',
    Default: 'An error occurred during authentication.',
  }

  const message = errorMessages[error || ''] || errorMessages.Default

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center text-red-600">
          Authentication Error
        </CardTitle>
        <CardDescription className="text-center">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Link href="/login">
          <Button>Back to Login</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  )
}
