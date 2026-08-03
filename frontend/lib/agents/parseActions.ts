import { executeViaComposio } from './composioExecutor'
import { inngest } from '@/lib/inngest/client'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

/**
 * Parses an AI response for [ACTION:] and [HANDOFF:] tags.
 * Executes actions via Composio and triggers coordination via Inngest.
 */
export async function parseAndExecuteActions(
  agentResponse: string,
  orgId: string,
  fromAgentId?: string,
  userId?: string,
  depth: number = 0
): Promise<{ cleanResponse: string; actionsExecuted: string[] }> {
  
  // Flexible regex to find [ACTION: tool="tool_name" params={...}]
  // Handles both double and single quotes, and optional spaces
  const actionRegex = /\[ACTION:\s*tool=["']([^"']+)["']\s*params=({[\s\S]+?})\]/gi
  const actionsExecuted: string[] = []
  let cleanResponse = agentResponse
  let match
  
  while ((match = actionRegex.exec(agentResponse)) !== null) {
    const [fullTag, tool, paramsStr] = match
    
    try {
      let params: any;
      try {
        params = JSON.parse(paramsStr);
      } catch {
        const sanitized = paramsStr.replace(/\r?\n/g, '\\n');
        try {
          params = JSON.parse(sanitized);
        } catch {
          params = Function(`"use strict"; return (${sanitized})`)();
        }
      }

      const serviceKey = tool.split('_')[0]
      const result = await executeViaComposio(orgId, serviceKey, tool, params)
      
      if (result.success) {
        actionsExecuted.push(`${tool} executed successfully`)
        cleanResponse = cleanResponse.replace(fullTag, 
          `\n> ✓ **Action executed:** ${tool.replace(/_/g, ' ')}\n`
        )
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error(`Failed to execute action ${tool}:`, error)
      cleanResponse = cleanResponse.replace(fullTag,
        `\n> ⚠️ **Action failed:** ${tool} — ${error.message || 'check your integrations'}\n`
      )
    }
  }

  // Parse handoffs [HANDOFF: to="ExecName" reason="why" context="what they need to know"]
  const handoffRegex = /\[HANDOFF:\s*to=["']([^"']+)["']\s*reason=["']([^"']+)["']\s*context=["']([^"']+)["']\]/gi
  while ((match = handoffRegex.exec(agentResponse)) !== null) {
    const [fullTag, toAgent, reason, context] = match
    
    try {
      const supabase = createServiceSupabaseClient()
      
      // Safely map frontend role shortcuts to exact internal Agent names for all 6 executives
      const roleToName: Record<string, string> = {
        'CEO': 'Atlas',
        'CMO': 'Aria',
        'CSO': 'Rex',
        'CCO': 'Purity',
        'CIO': 'Roman',
        'CTO': 'Ghost'
      }
      const actualName = roleToName[toAgent.toUpperCase()] || toAgent

      // Query the target agent and their department from Supabase
      const { data: targetAgent } = await supabase
        .from('agents')
        .select('id, acronym, departments!inner(key)')
        .eq('departments.org_id', orgId)
        .ilike('name', actualName)
        .limit(1)
        .single()

      // Comprehensive static fallbacks for all 6 executives
      const nameToAcronym: Record<string, string> = {
        'Atlas': 'CEO',
        'Aria': 'CMO',
        'Rex': 'CSO',
        'Purity': 'CCO',
        'Roman': 'CIO',
        'Ghost': 'CTO'
      }
      const nameToDept: Record<string, string> = {
        'Atlas': 'ops',
        'Aria': 'marketing',
        'Rex': 'sales',
        'Purity': 'cs',
        'Roman': 'intel',
        'Ghost': 'tech'
      }

      const targetAcronym = targetAgent?.acronym || nameToAcronym[actualName] || 'CEO'
      const targetDeptKey = (targetAgent?.departments as any)?.key || nameToDept[actualName] || 'ops'
      const targetAgentId = targetAgent?.id || null

      try {
        await inngest.send({
          name: 'agent/coordination.requested',
          data: {
            org_id: orgId,
            orgId, // backwards compatibility
            from_agent_id: fromAgentId,
            target_department_key: targetDeptKey,
            target_agent_acronym: targetAcronym,
            target_agent_id: targetAgentId,
            toAgent, // backwards compatibility
            reason,
            context,
            user_id: userId,
            depth: depth + 1
          }
        })
      } catch (inngestErr) {
        console.warn('[HANDOFF_INNGEST_WARN] Could not send Inngest event:', inngestErr)
      }
      
      cleanResponse = cleanResponse.replace(fullTag,
        `\n> 🔄 **Coordinating with ${toAgent}:** ${reason}\n`
      )
    } catch (err) {
      console.error(`Failed to trigger handoff to ${toAgent}:`, err)
    }
  }

  return { cleanResponse, actionsExecuted }
}
