import { inngest } from '../client';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin for background tasks
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 1. Weekly Autonomous Briefing
 * Fires every Monday at 9am UTC.
 * Atlas briefs all 5 department heads based on company goals.
 */
export const weeklyAutonomousBriefing = inngest.createFunction(
  { id: 'weekly-autonomous-briefing' },
  { cron: '0 9 * * 1' },
  async ({ step }) => {
    // Get all organizations with Autonomous Mode enabled
    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('autonomous_mode', true);

    if (!orgs || orgs.length === 0) return { count: 0 };

    for (const org of orgs) {
      await step.run(`brief-org-${org.id}`, async () => {
        // Logic for Atlas to generate and distribute briefings
        // This involves fetching company identity and tasking department heads
        const { data: identity } = await supabaseAdmin
          .from('company_identity')
          .select('*')
          .eq('org_id', org.id)
          .single();

        if (!identity) return { status: 'skipped', reason: 'no identity' };

        // Record a coordination event for Atlas
        await supabaseAdmin.from('coordination_events').insert({
          org_id: org.id,
          source_agent: 'Atlas',
          target_agent: 'All Heads',
          event_type: 'weekly_briefing',
          content: `Atlas is briefing the executive team for the week at ${org.name}.`,
          status: 'completed'
        });

        // In a real implementation, this would trigger LLM-backed tasks for each dept head.
        // For now, we simulate the autonomous start.
        return { status: 'briefed' };
      });
    }

    return { count: orgs.length };
  }
);

/**
 * 2. Daily Autonomous Digest
 * Fires daily at 6pm UTC.
 * Atlas compiles a digest of daily activities and posts it to Chat.
 */
export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 18 * * *' },
  async ({ step }) => {
    const { data: orgs } = await supabaseAdmin
      .from('organizations')
      .select('id, name')
      .eq('autonomous_mode', true);

    if (!orgs || orgs.length === 0) return { count: 0 };

    for (const org of orgs) {
      await step.run(`digest-org-${org.id}`, async () => {
        // Fetch tasks/actions completed today
        const today = new Date().toISOString().split('T')[0];
        
        const { data: actions } = await supabaseAdmin
          .from('audit_log')
          .select('*')
          .eq('org_id', org.id)
          .gte('created_at', today)
          .eq('actor_type', 'agent');

        const digestContent = `
⬡  ATLAS  ·  Daily Update

Your team worked on ${actions?.length || 0} tasks today.

${actions?.map(a => `- ${a.actor_user_id || 'Agent'}: ${a.action}`).join('\n') || 'No major actions recorded today.'}

[Review pending items →]
        `.trim();

        // Normally, this would be posted as a message in the "Chat" conversation (Change 1)
        // For now, we record it in the audit log or coordination feed.
        await supabaseAdmin.from('audit_log').insert({
          org_id: org.id,
          actor_type: 'system',
          action: 'daily_digest_delivered',
          metadata: { digest: digestContent }
        });

        return { status: 'delivered' };
      });
    }

    return { count: orgs.length };
  }
);
