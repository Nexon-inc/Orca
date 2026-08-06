import { executeViaComposio } from './composioExecutor'
import { inngest } from '@/lib/inngest/client'
import { createServiceSupabaseClient } from '@/lib/supabase/server'

export function formatUserFriendlyBadge(tool: string): string {
  const lower = tool.toLowerCase();
  if (lower.includes('twitter') || lower.includes('tweet') || lower.includes('x_post')) {
    return 'Posted announcement on X';
  }
  if (lower.includes('hubspot') && lower.includes('deal')) {
    return 'Created deal in HubSpot';
  }
  if (lower.includes('github') && (lower.includes('pr') || lower.includes('pull_request'))) {
    return 'Opened Pull Request on GitHub';
  }
  if (lower.includes('linkedin')) {
    return 'Shared update on LinkedIn';
  }
  if (lower.includes('slack')) {
    return 'Sent message in Slack';
  }
  if (lower.includes('notion')) {
    return 'Created page in Notion';
  }
  if (lower.includes('facebook')) {
    return 'Published post on Facebook';
  }
  if (lower.includes('instagram')) {
    return 'Uploaded media to Instagram';
  }
  if (lower.includes('email') || lower.includes('gmail')) {
    return 'Sent email outreach';
  }
  return `Executed ${tool.replace(/_/g, ' ')}`;
}

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
  
  // Flexible regex to find [ACTION: tool="tool_name" params={...}] and <ACTION: tool="tool_name" params={...}></ACTION>
  const actionRegex = /(?:\[|<)ACTION:\s*tool=["']([^"']+)["']\s*params=({[\s\S]+?})(?:\]|>(?:<\/ACTION>)?)/gi
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
          `\n> ✓ **${formatUserFriendlyBadge(tool)}**\n`
        )
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error(`Failed to execute action ${tool}:`, error)
      let errMsg = error.message || String(error)
      if (errMsg.includes('client-not-enrolled') || errMsg.includes('Client Forbidden') || errMsg.includes('developer App')) {
        errMsg = 'X (Twitter) API v2 requires an App enrolled in a Developer Project on X. Please connect your X App credentials in Composio settings.'
      } else if (errMsg.includes('Not Found') && tool.includes('github')) {
        errMsg = 'GitHub repository or branch not found. Check repository permissions in Composio settings.'
      }
      cleanResponse = cleanResponse.replace(fullTag,
        `\n> ⚠️ **Action failed:** ${tool} — ${errMsg}\n`
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

      // Record coordination event in Supabase DB so GET /api/org/[id]/coordinations populates active tasks
      try {
        const { error: insertErr } = await supabase.from('coordination_events').insert({
          org_id: orgId,
          from_agent_id: fromAgentId || null,
          to_agent_id: targetAgentId || null,
          type: 'handoff',
          status: 'running',
          description: `Handed off to ${actualName}: ${reason}`,
          context: { reason, context, toAgent: actualName },
          created_at: new Date().toISOString()
        });
        if (insertErr) console.warn('[COORDINATION_DB_WARN] DB insert note:', insertErr);
      } catch (dbErr) {
        console.warn('[COORDINATION_DB_WARN] Could not record coordination event:', dbErr);
      }

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

  cleanResponse = cleanResponse
    .replace(/(?:\[|<)ACTION:[\s\S]*?(?:\]|>(?:<\/ACTION>)?)/gi, '')
    .replace(/<\/ACTION>/gi, '')
    .trim();

  return { cleanResponse, actionsExecuted }
}
