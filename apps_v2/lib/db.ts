import { Pool } from "pg"

// Connection will be established once and reused
let pool: Pool | null = null

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

export async function executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  const pool = getPool()
  try {
    const result = await pool.query(query, params)
    return result.rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Close the pool when the application shuts down
process.on("SIGINT", () => {
  if (pool) {
    pool.end()
  }
})
