import { cookies } from "next/headers"
import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/database.types"

export const createServerClient = () => createServerComponentClient<Database>({ cookies })
export const createServerActionClient = () => createRouteHandlerClient<Database>({ cookies })
