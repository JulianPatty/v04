import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Workflow Editor</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Create, manage, and visualize your workflows with ease
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/auth/login" className="block">
            <Button className="w-full" size="lg">
              Sign In
            </Button>
          </Link>
          
          <Link href="/auth/signup" className="block">
            <Button className="w-full" size="lg" variant="outline">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}