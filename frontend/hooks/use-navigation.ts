"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"

export function useNavigation() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const navigateTo = (href: string) => {
    startTransition(() => {
      router.push(href)
    })
  }

  const navigateBack = () => {
    startTransition(() => {
      router.back()
    })
  }

  const navigateForward = () => {
    startTransition(() => {
      router.forward()
    })
  }

  const refresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  return {
    navigateTo,
    navigateBack,
    navigateForward,
    refresh,
    isPending,
  }
}
