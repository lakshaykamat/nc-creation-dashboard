/**
 * Team Member Form Component
 * 
 * Dialog form for creating and editing team members
 * 
 * @module components/teams/team-member-form
 */

"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { TeamMember } from "@/types/teams"

interface TeamMemberFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  member?: TeamMember | null
  onSubmit: (name: string) => Promise<void>
  isLoading?: boolean
}

interface FormValues {
  name: string
}

export function TeamMemberForm({
  open,
  onOpenChange,
  member,
  onSubmit,
  isLoading = false,
}: TeamMemberFormProps) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
    },
  })

  // Reset form when dialog opens/closes or member changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: member?.name || "",
      })
      setError(null)
    }
  }, [open, member, form])

  const handleSubmit = async (values: FormValues) => {
    try {
      setError(null)
      await onSubmit(values.name.trim())
      form.reset()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    }
  }

  const isEditMode = !!member

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Team Member" : "Add Team Member"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the team member's name."
              : "Add a new team member to the list."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{
                required: "Name is required",
                minLength: {
                  value: 1,
                  message: "Name must be at least 1 character",
                },
                maxLength: {
                  value: 100,
                  message: "Name must be less than 100 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter member name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

