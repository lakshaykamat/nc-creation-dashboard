"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useAuth } from "@/hooks/use-auth"
import type { UserRole } from "@/lib/auth-utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const { login, isLoggingIn, loginError } = useAuth()
  const [role, setRole] = useState<UserRole>("MEMBER")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!password.trim()) {
      return
    }

    login({ role, password })
  }

  const errorMessage = loginError instanceof Error 
    ? loginError.message 
    : typeof loginError === "string" 
    ? loginError 
    : undefined

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Select your role and enter your password
          </p>
        </div>
        <Field>
          <FieldLabel>Role</FieldLabel>
          <RadioGroup
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="MEMBER" id="member" />
              <Label htmlFor="member" className="cursor-pointer">
                MEMBER
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ADMIN" id="admin" />
              <Label htmlFor="admin" className="cursor-pointer">
                ADMIN
              </Label>
            </div>
          </RadioGroup>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </Field>
        {errorMessage && (
          <div className="text-destructive text-sm">{errorMessage}</div>
        )}
        <Field>
          <Button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Logging in..." : "Login"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
