import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

function createDb() {
  if (!connectionString || connectionString === "your_database_url") {
    // Return a proxy that throws helpful errors during development
    return new Proxy({} as any, {
      get(_, prop) {
        if (typeof prop === "string") {
          return (..._args: any[]) => {
            throw new Error(
              `Database not configured. Set DATABASE_URL in .env.local to your Supabase pooled connection URL.`
            );
          };
        }
      },
    });
  }
  const client = postgres(connectionString, { prepare: false });
  return drizzle(client, { schema });
}

export const db = createDb();
