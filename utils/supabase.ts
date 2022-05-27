import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const key = process.env.NEXT_PUBLIC_SUPABASE_KEY as string
const serviceKey = process.env.SUPABASE_SERVICE_KEY as string

export const supabase = createClient(url, key)
export const getServiceSupabase = () => createClient(url, serviceKey)
