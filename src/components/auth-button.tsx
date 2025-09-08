'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <p>Signed in as {session.user?.email}</p>
        <Button onClick={() => signOut()}>Sign out</Button>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-4">
        <p>Not signed in</p>
        <Button onClick={() => signIn()}>Sign in</Button>
    </div>
  )
}
