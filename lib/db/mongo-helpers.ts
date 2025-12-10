/**
 * MongoDB Helper Functions
 * 
 * Type-safe helpers for MongoDB operations
 * 
 * @module lib/db/mongo-helpers
 */

import { ObjectId } from "mongodb"

/**
 * Create a filter for MongoDB queries using ObjectId
 * 
 * Note: Uses type assertion because MongoDB uses ObjectId at runtime,
 * but our TypeScript types define _id as string for JSON serialization.
 * This is a known limitation when working with MongoDB and TypeScript.
 */
export function findByIdFilter<T extends { _id: string }>(id: string): { _id: ObjectId } & Partial<T> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId format")
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { _id: new ObjectId(id) } as any
}

/**
 * Create a filter for excluding a document by ObjectId
 */
export function excludeByIdFilter<T extends { _id: string }>(id: string): { _id: { $ne: ObjectId } } & Partial<T> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid ObjectId format")
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { _id: { $ne: new ObjectId(id) } } as any
}

