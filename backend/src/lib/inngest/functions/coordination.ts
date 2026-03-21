import { inngest } from '../client'
import { createClient } from '@supabase/supabase-js'

export const handleCoordinationRequest = inngest.createFunction(
  { id: 'handle-coordination-request' },
  { event: 'agent/coordination.requested' },
  async ({ event, step }) => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { org_id, from_agent_id, target_department_key, reason, context } = event.data

    // 1. Find the target dept and its head
    const { data: dept } = await step.run('get-target-dept', async () => {
      return supabase
        .from('departments')
        .select('*, profiles!head_user_id(*)')
        .eq('org_id', org_id)
        .eq('key', target_department_key)
        .single()
        .then(r => r.data)
    })

    // 2. Check auto-approval conditions
    const isLowStakes = ['brief', 'trigger'].includes(event.data.type || 'handoff')
    const hasHead = !!dept?.head_user_id

    if (isLowStakes && hasHead) {
      // Auto-approve
      await step.run('auto-approve', async () => {
        return supabase.from('coordination_events').insert({
          org_id,
          from_agent_id,
          to_agent_id: event.data.target_agent_id,
          type: event.data.type || 'handoff',
          description: reason,
          context,
          status: 'complete',
          auto_approved: true,
        })
      })
      return { approved: true, auto: true }
    }

    // 3. Create approval request
    const escalateToCeo = !hasHead
    await step.run('create-approval-request', async () => {
      return supabase.from('approval_requests').insert({
        org_id,
        initiated_by_agent_id: from_agent_id,
        target_department_key,
        context: reason,
        urgency: escalateToCeo ? 'warning' : 'info',
        status: 'pending',
      })
    })

    // 4. Notify the right person
    await step.run('send-notification', async () => {
      const notifyUserId = escalateToCeo
        ? (await supabase.from('org_members')
            .select('user_id')
            .eq('org_id', org_id)
            .eq('role', 'owner')
            .single()).data?.user_id
        : dept?.head_user_id

      if (notifyUserId) {
        // Create in-app notification (via team_messages system notification)
        return supabase.from('team_messages').insert({
          org_id,
          from_user_id: notifyUserId, // system sends to self as notification
          to_user_id: notifyUserId,
          content: `Agent coordination request pending your approval: ${reason}`,
          is_system_notification: true,
        })
      }
    })

    return { approved: false, escalated_to_ceo: escalateToCeo }
  }
)
