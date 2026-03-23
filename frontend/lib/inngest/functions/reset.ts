import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

export const handleAgentReset = inngest.createFunction(
  { id: 'daily-agent-reset' },
  { cron: '0 0 * * *' }, // Midnight UTC daily
  async ({ step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    await step.run('reset-task-counts', async () => {
      return supabase
        .from('agents')
        .update({ tasks_today: 0, status: 'idle' })
        .neq('id', '00000000-0000-0000-0000-000000000000') // all rows
    })

    return { reset: true }
  }
)
