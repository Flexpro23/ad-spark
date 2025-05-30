"use client"

import { useEffect, useState } from "react"
import { Toaster } from "@/components/ui/toaster"

export function ClientToaster() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Return null on server-side and during initial client-side render
  if (!mounted) {
    return null
  }

  return <Toaster />
} 