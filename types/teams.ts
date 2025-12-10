/**
 * Type definitions for Teams feature
 * 
 * @module types/teams
 */

/**
 * Team member structure stored in MongoDB
 */
export interface TeamMember {
  /** MongoDB ObjectId as string */
  _id: string
  /** Member name */
  name: string
}

/**
 * Request body for creating a team member
 */
export interface CreateTeamMemberRequest {
  name: string
}

/**
 * Request body for updating a team member
 */
export interface UpdateTeamMemberRequest {
  name: string
}

/**
 * API response for team member operations
 */
export interface TeamMemberResponse {
  success: boolean
  data?: TeamMember
  message?: string
  error?: string
}

/**
 * API response for listing team members
 */
export interface TeamMembersResponse {
  success: boolean
  data?: TeamMember[]
  message?: string
  error?: string
}

