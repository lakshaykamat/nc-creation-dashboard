/**
 * Centralized NC Database Operations
 * 
 * Provides type-safe, centralized database operations for the "nc" database
 * This layer abstracts common database operations and ensures consistency
 * 
 * @module lib/db/nc-operations
 */

import { Document, Filter, ObjectId, Sort, UpdateFilter, WithId } from "mongodb"
import { getNCCollection } from "./nc-database"

/**
 * Find all documents in a collection
 */
export async function findAllDocuments<T extends Document>(
  collectionName: string
): Promise<WithId<T>[]> {
  const collection = await getNCCollection<T>(collectionName)
  return collection.find({}).toArray()
}

/**
 * Find documents with a filter
 */
export async function findDocuments<T extends Document>(
  collectionName: string,
  filter: Filter<T> = {},
  options?: {
    sort?: Sort
    skip?: number
    limit?: number
  }
): Promise<WithId<T>[]> {
  const collection = await getNCCollection<T>(collectionName)
  let query = collection.find(filter)

  if (options?.sort) {
    query = query.sort(options.sort)
  }
  if (options?.skip !== undefined) {
    query = query.skip(options.skip)
  }
  if (options?.limit !== undefined) {
    query = query.limit(options.limit)
  }

  return query.toArray()
}

/**
 * Find a single document by filter
 */
export async function findOneDocument<T extends Document>(
  collectionName: string,
  filter: Filter<T>
): Promise<WithId<T> | null> {
  const collection = await getNCCollection<T>(collectionName)
  return collection.findOne(filter)
}

/**
 * Find a document by ID
 */
export async function findDocumentById<T extends Document>(
  collectionName: string,
  id: string | ObjectId
): Promise<WithId<T> | null> {
  const collection = await getNCCollection<T>(collectionName)
  const objectId = typeof id === "string" ? new ObjectId(id) : id
  return collection.findOne({ _id: objectId } as Filter<T>)
}

/**
 * Insert a document
 */
export async function insertDocument<T extends Document>(
  collectionName: string,
  document: T
): Promise<string> {
  const collection = await getNCCollection<T>(collectionName)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await collection.insertOne(document as any)
  return result.insertedId.toString()
}

/**
 * Update a document by filter
 */
export async function updateDocument<T extends Document>(
  collectionName: string,
  filter: Filter<T>,
  update: UpdateFilter<T>
): Promise<boolean> {
  const collection = await getNCCollection<T>(collectionName)
  const result = await collection.updateOne(filter, update)
  return result.modifiedCount > 0
}

/**
 * Update a document by ID
 */
export async function updateDocumentById<T extends Document>(
  collectionName: string,
  id: string | ObjectId,
  update: UpdateFilter<T>
): Promise<boolean> {
  const objectId = typeof id === "string" ? new ObjectId(id) : id
  return updateDocument(collectionName, { _id: objectId } as Filter<T>, update)
}

/**
 * Delete a document by filter
 */
export async function deleteDocument<T extends Document>(
  collectionName: string,
  filter: Filter<T>
): Promise<boolean> {
  const collection = await getNCCollection<T>(collectionName)
  const result = await collection.deleteOne(filter)
  return result.deletedCount > 0
}

/**
 * Delete a document by ID
 */
export async function deleteDocumentById<T extends Document>(
  collectionName: string,
  id: string | ObjectId
): Promise<boolean> {
  const objectId = typeof id === "string" ? new ObjectId(id) : id
  return deleteDocument(collectionName, { _id: objectId } as Filter<T>)
}

/**
 * Count documents matching a filter
 */
export async function countDocuments<T extends Document>(
  collectionName: string,
  filter: Filter<T> = {}
): Promise<number> {
  const collection = await getNCCollection<T>(collectionName)
  return collection.countDocuments(filter)
}

/**
 * Run an aggregation pipeline
 */
export async function aggregateDocuments<T extends Document>(
  collectionName: string,
  pipeline: Document[]
): Promise<T[]> {
  const collection = await getNCCollection<T>(collectionName)
  return collection.aggregate<T>(pipeline).toArray()
}

/**
 * Check if a document exists
 */
export async function documentExists<T extends Document>(
  collectionName: string,
  filter: Filter<T>
): Promise<boolean> {
  const collection = await getNCCollection<T>(collectionName)
  const count = await collection.countDocuments(filter, { limit: 1 })
  return count > 0
}

/**
 * Check if a document exists by ID
 */
export async function documentExistsById<T extends Document>(
  collectionName: string,
  id: string | ObjectId
): Promise<boolean> {
  const objectId = typeof id === "string" ? new ObjectId(id) : id
  return documentExists(collectionName, { _id: objectId } as Filter<T>)
}

