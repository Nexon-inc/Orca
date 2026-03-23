import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supa = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supa.from('orcahub_templates').select('*')
  console.log('Templates Count:', data?.length)
  if (data?.length === 0) {
    console.log('Needs seeding. Here are the 6 official templates...')
    // I can put the insert here if it's 0.
  }
}

run()
