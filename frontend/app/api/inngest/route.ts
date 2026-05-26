import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { 
  approvalReminderFn, 
  agentDailyResetFn, 
  oauthStateCleanupFn, 
  agentCoordinationFn,
  agentMemoryUpdateFn,
  conversationTitleFn 
} from '@/lib/inngest/functions'
import { handleWeeklyReports } from '@/lib/inngest/functions/reports'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    approvalReminderFn,
    agentDailyResetFn,
    oauthStateCleanupFn,
    agentCoordinationFn,
    agentMemoryUpdateFn,
    conversationTitleFn,
    handleWeeklyReports,
  ],
})
