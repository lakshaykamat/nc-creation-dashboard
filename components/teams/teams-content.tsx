/**
 * Teams Content Component
 * 
 * Main content component for teams page with table and CRUD operations
 * 
 * @module components/teams/teams-content
 */

"use client"

import { useState } from "react"
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/hooks/teams/use-teams"
import { TeamMemberTable } from "./team-member-table"
import { TeamMemberForm } from "./team-member-form"
import { Button } from "@/components/ui/button"
import { Plus, RefreshCw } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorCard } from "@/components/common/error-card"
import type { TeamMember } from "@/types/teams"

export function TeamsContent() {
  const { data: members = [], isLoading, error, refetch, isRefetching } = useTeams()
  const createTeam = useCreateTeam()
  const updateTeam = useUpdateTeam()
  const deleteTeam = useDeleteTeam()

  const [formOpen, setFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const handleCreate = async (name: string) => {
    await createTeam.mutateAsync({ name })
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormOpen(true)
  }

  const handleUpdate = async (name: string) => {
    if (!editingMember) return
    await updateTeam.mutateAsync({
      id: editingMember._id,
      data: { name },
    })
    setEditingMember(null)
  }

  const handleDelete = async (id: string) => {
    await deleteTeam.mutateAsync(id)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingMember(null)
  }

  const handleAddClick = () => {
    setEditingMember(null)
    setFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-2">
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-md border">
          <div className="p-4 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorCard
        error={error instanceof Error ? error : new Error("Failed to load team members")}
        onRetry={() => refetch()}
        retryLabel={isRefetching ? "Retrying..." : "Try Again"}
      />
    )
  }

  const isMutating = createTeam.isPending || updateTeam.isPending || deleteTeam.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button onClick={handleAddClick} disabled={isMutating}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      <TeamMemberTable
        members={members}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteTeam.isPending}
      />

      <TeamMemberForm
        open={formOpen}
        onOpenChange={handleFormClose}
        member={editingMember}
        onSubmit={editingMember ? handleUpdate : handleCreate}
        isLoading={createTeam.isPending || updateTeam.isPending}
      />
    </div>
  )
}

