"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import type { UserRole, LoginCredentials } from "@/lib/auth-utils"

interface LoginResponse {
  success: boolean
  role?: UserRole
  error?: string
}

interface LoginError {
  error: string
}

async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })

  const data = await response.json()

  if (!response.ok) {
    const errorData = data as LoginError
    throw new Error(errorData.error || "Login failed")
  }

  return data as LoginResponse
}

async function logoutUser(): Promise<void> {
  const response = await fetch("/api/logout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Logout failed")
  }
}

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries()
      
      // Get redirect path from URL or default to home
      const redirect = typeof window !== "undefined" 
        ? new URLSearchParams(window.location.search).get("redirect") || "/"
        : "/"
      router.push(redirect)
      router.refresh()
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear()
      
      // Redirect to login
      router.push("/login")
      router.refresh()
    },
  })

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
  }
}

