import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  const { data } = await sb
    .from('waitlist_stats')
    .select('*')
    .single()
  res.json(data || { total:0, tenants:0, landlords:0 })
}