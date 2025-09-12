"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export default function ProfilePopover({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const signOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/")
      }
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <Button
          variant="destructive"
          className="font-normal w-full"
          onClick={signOut}
        >
          Sign out
        </Button>
      </PopoverContent>
    </Popover>
  )
}