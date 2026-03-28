import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

export const handleWeeklyReports = inngest.createFunction(
  { id: 'weekly-dept-reports' },
  { cron: '0 9 * * MON' }, // Every Monday 9am UTC
  async ({ step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all active orgs
    const orgs = await step.run('get-active-orgs', async () => {
      return supabase
        .from('organizations')
        .select('id, name, plan')
        .then(r => r.data)
    })

    // For each org, generate dept reports
    for (const org of orgs || []) {
      await step.run(`generate-reports-${org.id}`, async () => {
        const query = supabase
          .from('departments')
          .select('*, agents(*)')
          .eq('org_id', org.id)
        
        // Free plan limit: only 1 department's report
        if (org.plan === 'free') {
          query.limit(1)
        }

        const { data: depts } = await query

        for (const dept of depts || []) {
          // Aggregate last 7 days of agent activity
          const stats = {
            tasks_completed: dept.agents?.reduce((sum: number, a: any) => sum + (a.tasks_today || 0), 0),
            agents_active: dept.agents?.filter((a: any) => a.status === 'active').length,
            period: 'weekly',
          }

          await supabase.from('dept_reports').insert({
            org_id: org.id,
            department_key: dept.key,
            submitted_by_user_id: dept.head_user_id,
            period_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            period_end: new Date().toISOString().split('T')[0],
            stats,
            acknowledged_by_ceo: false,
          })
        }
      })
    }

    return { orgs_processed: orgs?.length }
  }
)
