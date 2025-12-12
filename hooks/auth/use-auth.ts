"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import type { UserRole, LoginCredentials } from "@/lib/auth/auth-utils"

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
    credentials: "include",
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
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Logout failed")
  }
}

/**
 * Manages authentication state and operations
 * 
 * Handles user login and logout with automatic query invalidation and
 * navigation. On successful login, invalidates all queries to refresh
 * data and redirects to the requested page (or home). On logout, clears
 * all cached queries and redirects to login page.
 * 
 * @returns Object containing:
 *   - login: Function to login with credentials
 *   - logout: Function to logout current user
 *   - isLoggingIn/isLoggingOut: Boolean states for mutation progress
 *   - loginError/logoutError: Error objects if mutations fail
 */
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

