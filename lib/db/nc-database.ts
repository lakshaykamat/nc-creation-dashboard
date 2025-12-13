/**
 * Unified NC Database Client
 * 
 * Provides a single entry point for accessing the "nc" MongoDB database
 * This ensures all database operations use the correct database name consistently
 * 
 * @module lib/db/nc-database
 */

import { Document } from "mongodb"
import clientPromise from "./mongo"
import { DATABASE_NAME } from "@/lib/constants/database-constants"

/**
 * Get the "nc" database instance
 * 
 * @returns Promise that resolves to the MongoDB database instance for "nc"
 * 
 * @example
 * ```ts
 * const db = await getNCDatabase()
 * const collection = db.collection("logs")
 * ```
 */
export async function getNCDatabase() {
  const client = await clientPromise
  return client.db(DATABASE_NAME)
}

/**
 * Get a collection from the "nc" database
 * 
 * @param collectionName - Name of the collection to access
 * @returns Promise that resolves to the MongoDB collection
 * 
 * @example
 * ```ts
 * const logsCollection = await getNCCollection("logs")
 * const logs = await logsCollection.find({}).toArray()
 * ```
 */
export async function getNCCollection<T extends Document = Document>(collectionName: string) {
  const db = await getNCDatabase()
  return db.collection<T>(collectionName)
}

