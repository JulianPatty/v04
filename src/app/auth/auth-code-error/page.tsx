import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4 px-4 text-center">
        <h2 className="text-2xl font-bold">Authentication Error</h2>
        <p className="text-muted-foreground">
          There was an error authenticating your account. This could be due to an expired or invalid
          authentication link.
        </p>
        <div className="pt-4">
          <Link href="/auth/login">
            <Button>Try again</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}