import { executeViaComposio } from './composioExecutor'
import { inngest } from '@/lib/inngest/client'

/**
 * Parses an AI response for [ACTION:] and [HANDOFF:] tags.
 * Executes actions via Composio and triggers coordination via Inngest.
 */
export async function parseAndExecuteActions(
  agentResponse: string,
  orgId: string
): Promise<{ cleanResponse: string; actionsExecuted: string[] }> {
  
  // Regex to find [ACTION: tool="tool_name" params={...}]
  const actionRegex = /\[ACTION: tool="([^"]+)" params=({[^}]+})\]/g
  const actionsExecuted: string[] = []
  let cleanResponse = agentResponse
  let match

  while ((match = actionRegex.exec(agentResponse)) !== null) {
    const [fullTag, tool, paramsStr] = match
    
    try {
      const params = JSON.parse(paramsStr)
      
      // Derive serviceKey from tool name (e.g. "linkedin_post" -> "linkedin")
      const serviceKey = tool.split('_')[0]
      
      // Execute via Composio
      const result = await executeViaComposio(orgId, serviceKey, tool, params)
      
      if (result.success) {
        actionsExecuted.push(`${tool} executed successfully`)
        cleanResponse = cleanResponse.replace(fullTag, 
          `\n> ✓ **Action executed:** ${tool.replace(/_/g, ' ')}\n`
        )
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error(`Failed to execute action ${tool}:`, error)
      cleanResponse = cleanResponse.replace(fullTag,
        `\n> ⚠️ **Action failed:** ${tool} — check your integrations\n`
      )
    }
  }

  // Parse handoffs [HANDOFF: to="ExecName" reason="why" context="what they need to know"]
  const handoffRegex = /\[HANDOFF: to="([^"]+)" reason="([^"]+)" context="([^"]+)"\]/g
  while ((match = handoffRegex.exec(agentResponse)) !== null) {
    const [fullTag, toAgent, reason, context] = match
    
    try {
      // Fire coordination event via Inngest
      await inngest.send({
        name: 'agent/coordination.requested',
        data: { orgId, toAgent, reason, context }
      })
      
      cleanResponse = cleanResponse.replace(fullTag,
        `\n> 🔄 **Coordinating with ${toAgent}:** ${reason}\n`
      )
    } catch (err) {
      console.error(`Failed to trigger handoff to ${toAgent}:`, err)
    }
  }

  return { cleanResponse, actionsExecuted }
}
