'use client'

import { ProtectedRoute } from '@/components/auth/protected-route'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
          
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome!</h2>
            <p className="text-muted-foreground">
              You are signed in as: <span className="font-medium">{user?.email}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              User ID: {user?.id}
            </p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}