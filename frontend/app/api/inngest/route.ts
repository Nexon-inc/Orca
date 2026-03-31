import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest/client'
import { handleCoordinationRequest } from '@/lib/inngest/functions/coordination'
import { handleWeeklyReports } from '@/lib/inngest/functions/reports'
import { handleAgentReset } from '@/lib/inngest/functions/reset'
import { weeklyAutonomousBriefing, dailyDigest } from '@/lib/inngest/functions/autonomous'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    handleCoordinationRequest,
    handleWeeklyReports,
    handleAgentReset,
    weeklyAutonomousBriefing,
    dailyDigest,
  ],
})
