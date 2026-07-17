import { tool } from 'ai'
import { z } from 'zod'
import { executeViaComposio } from './composioExecutor'
import { 
  webSearchSkill, 
  scrapePageSkill, 
  linkedinPostSkill, 
  twitterPostSkill,
  discordPostSkill,
  facebookPostSkill,
  pinterestPostSkill,
  instagramPostSkill,
  snapchatPostSkill,
  hubspotCreateDealSkill, 
  githubCreatePRSkill, 
  instagramStatisticsSkill,
  trackProgressReportSkill,
  generateMarketingCopySkill,
  analyzeLeadsSkill,
  analyzeCustomerSentimentSkill,
  analyzeCompetitorTrafficSkill,
  validateTechArchitectureSkill,
  youtubeVideoStrategySkill,
  youtubeVideoMetricsSkill,
  seoMetadataOptimizationSkill,
  competitorSeoAuditSkill,
  validateSeoPerformanceSkill,
  googleEcosystemSkill,
  metaEcosystemSkill,
  microsoftEcosystemSkill,
  crunchbaseResearchSkill,
  apolloEnrichmentSkill,
  googleTrendsSkill,
  tiktokMarketingSkill,
  shodanSecurityAuditSkill,
  g2SentimentSkill,
  alphaVantageFinancialSkill,
  prospectColdMarketSkill,
  nicheFinderSkill,
  idealProfileArchitectSkill,
  first100CustomersSkill,
  customerFeedbackLoopSkill,
  convertFirstUsersSkill,
  viralHookGeneratorSkill,
  zeroBudgetLaunchSkill,
  communityFlywheelSkill,
  weeklyUpdateDigestSkill,
  whitespaceFinderSkill,
  competitorSiphonSkill,
  mvpScaffoldSkill,
  techStackDeciderSkill,
  launchWeekBriefingSkill,
  foundingUserStrategySkill
} from './skills'
import { readWikiPage, writeWikiPage, listWikiPages } from './wiki'
import { fetchOrgMetrics } from '@/lib/analytics/orgMetrics'

function orgAnalyticsTool(orgId: string) {
  return tool({
    description:
      'Fetch live company analytics: plan tier, monthly task usage, active departments, team size, connected integrations, briefings saved, sales pipeline, and coordination events.',
    parameters: z.object({}),
    execute: async () => {
      try {
        return await fetchOrgMetrics(orgId)
      } catch (err: any) {
        return { error: `Analytics fetch failed: ${err.message}` }
      }
    },
  })
}

function googleEcosystemAdapter(
  orgId: string,
  service: 'drive' | 'docs' | 'sheets' | 'calendar' | 'gmail',
  action: string,
  desc: string
) {
  return tool({
    description: desc,
    parameters: z.record(z.any()),
    execute: async (params) => {
      try {
        const eco = googleEcosystemSkill(orgId)
        return await eco.execute({ service, action, payload: params })
      } catch (err: any) {
        return { error: `${service} action failed: ${err.message}` }
      }
    }
  })
}

function slackPostSkill(orgId: string) {
  return tool({
    description: 'Post a message to a Slack channel.',
    parameters: z.object({
      channel: z.string().describe('Slack channel name or ID (e.g., "general", "C123456")'),
      message: z.string().describe('Message content to post')
    }),
    execute: async (params) => {
      try {
        return await executeViaComposio(orgId, 'slack', 'slack_post', {
          channel: params.channel,
          text: params.message
        })
      } catch (err: any) {
        return { error: `Slack post failed: ${err.message}` }
      }
    }
  })
}

function notionCreatePageSkill(orgId: string) {
  return tool({
    description: 'Create a new page in Notion.',
    parameters: z.object({
      title: z.string().describe('Notion page title'),
      content: z.string().describe('Notion page body content')
    }),
    execute: async (params) => {
      try {
        return await executeViaComposio(orgId, 'notion', 'notion_create_page', params)
      } catch (err: any) {
        return { error: `Notion page creation failed: ${err.message}` }
      }
    }
  })
}

/**
 * Builds the native tools available for an executive by referencing
 * modular, centralized skills from skills.ts and wiki.ts.
 */
export function buildToolsForAgent(
  agentName: string,
  orgId: string,
  connectedServices: string[]
) {
  const tools: Record<string, any> = {}

  // Shared Wiki tools for all 6 agents to collaborate on specs, plans, and instructions
  tools.read_wiki_page = tool({
    description: 'Read a specific strategic plan, blueprint, or markdown page from the shared corporate wiki directory.',
    parameters: z.object({
      pageTitle: z.string().describe('The title of the wiki page to read (e.g. "competitor_battlecard", "q3_overview")')
    }),
    execute: async ({ pageTitle }) => {
      try {
        return await readWikiPage.execute({ orgId, pageTitle })
      } catch (err: any) {
        return { error: `Wiki read failed: ${err.message}` }
      }
    }
  })

  tools.write_wiki_page = tool({
    description: 'Publish or update a markdown page (Summary, Entity page, Concept page, Comparison, Overview, or Synthesis) to the shared corporate wiki directory.',
    parameters: z.object({
      pageTitle: z.string().describe('The title of the wiki page (e.g. "competitor_battlecard")'),
      pageType: z.enum(['overview', 'summary', 'entity', 'concept', 'comparison', 'synthesis']).describe('The category of the wiki markdown file'),
      markdownContent: z.string().describe('The page content in clean Markdown (H1, checklist, code blocks)')
    }),
    execute: async ({ pageTitle, pageType, markdownContent }) => {
      try {
        return await writeWikiPage.execute({ orgId, pageTitle, pageType, markdownContent })
      } catch (err: any) {
        return { error: `Wiki publish failed: ${err.message}` }
      }
    }
  })

  tools.list_wiki_pages = tool({
    description: 'List the entire directory of corporate wiki pages, categorizing them by Overview, Summaries, Entities, Concepts, Comparisons, and Synthesis to make it easy to find relevant specs.',
    parameters: z.object({}),
    execute: async () => {
      try {
        return await listWikiPages.execute({ orgId })
      } catch (err: any) {
        return { error: `Wiki directory list failed: ${err.message}` }
      }
    }
  })

  // Register central skills based on executive department roles
  if (['Atlas', 'Roman', 'Rex', 'Purity'].includes(agentName)) {
    tools.get_org_analytics = orgAnalyticsTool(orgId)
  }

  if (['Aria', 'Rex', 'Roman', 'Ghost'].includes(agentName)) {
    tools.web_search = webSearchSkill
    tools.scrape_page = scrapePageSkill
  }

  if (['Aria', 'Roman'].includes(agentName)) {
    tools.instagram_statistics = instagramStatisticsSkill
  }

  // 1. CEO (Atlas)
  if (agentName === 'Atlas') {
    tools.track_progress_report = trackProgressReportSkill
    tools.google_ecosystem = googleEcosystemSkill(orgId)
    tools.microsoft_ecosystem = microsoftEcosystemSkill(orgId)
    tools.alpha_vantage_financial = alphaVantageFinancialSkill
    tools.launch_week_briefing = launchWeekBriefingSkill
    tools.founding_user_strategy = foundingUserStrategySkill
  }

  // 2. CMO (Aria)
  if (agentName === 'Aria') {
    tools.generate_marketing_copy = generateMarketingCopySkill
    tools.youtube_video_strategy = youtubeVideoStrategySkill
    tools.seo_metadata_optimization = seoMetadataOptimizationSkill
    tools.google_ecosystem = googleEcosystemSkill(orgId)
    tools.meta_ecosystem = metaEcosystemSkill(orgId)
    tools.google_trends = googleTrendsSkill
    tools.tiktok_marketing = tiktokMarketingSkill
    tools.viral_hook_generator = viralHookGeneratorSkill
    tools.zero_budget_launch = zeroBudgetLaunchSkill
    tools.community_flywheel = communityFlywheelSkill
    tools.weekly_update_digest = weeklyUpdateDigestSkill
    
    // Mount all active social platforms post/webhook skills for Aria (CMO)
    if (connectedServices.includes('linkedin')) {
      tools.linkedin_post = linkedinPostSkill(orgId)
    }
    if (connectedServices.includes('twitter') || connectedServices.includes('x')) {
      tools.twitter_post = twitterPostSkill(orgId)
      tools.tweet_post = twitterPostSkill(orgId)
    }
    if (connectedServices.includes('discord')) {
      tools.discord_post = discordPostSkill(orgId)
    }
    if (connectedServices.includes('facebook')) {
      tools.facebook_post = facebookPostSkill(orgId)
    }
    if (connectedServices.includes('pinterest')) {
      tools.pinterest_post = pinterestPostSkill(orgId)
    }
    if (connectedServices.includes('instagram')) {
      tools.instagram_post = instagramPostSkill(orgId)
    }
    
    // Snapchat demographic outreach campaign skill
    tools.snapchat_post = snapchatPostSkill(orgId)
  }

  // 3. CSO (Rex)
  if (agentName === 'Rex') {
    tools.analyze_leads = analyzeLeadsSkill
    tools.google_ecosystem = googleEcosystemSkill(orgId)
    tools.meta_ecosystem = metaEcosystemSkill(orgId)
    tools.microsoft_ecosystem = microsoftEcosystemSkill(orgId)
    tools.apollo_enrichment = apolloEnrichmentSkill
    tools.prospect_cold_market = prospectColdMarketSkill
    tools.niche_finder = nicheFinderSkill
    tools.ideal_profile_architect = idealProfileArchitectSkill
    tools.convert_first_users = convertFirstUsersSkill
    if (connectedServices.includes('hubspot')) {
      tools.hubspot_create_deal = hubspotCreateDealSkill(orgId)
    }
  }

  // 4. CCO (Purity)
  if (agentName === 'Purity') {
    tools.analyze_customer_sentiment = analyzeCustomerSentimentSkill
    tools.microsoft_ecosystem = microsoftEcosystemSkill(orgId)
    tools.g2_sentiment = g2SentimentSkill
    tools.first_100_customers = first100CustomersSkill
    tools.customer_feedback_loop = customerFeedbackLoopSkill
    tools.convert_first_users = convertFirstUsersSkill
  }

  // 5. CIO (Roman)
  if (agentName === 'Roman') {
    tools.analyze_competitor_traffic = analyzeCompetitorTrafficSkill
    tools.youtube_video_metrics = youtubeVideoMetricsSkill
    tools.competitor_seo_audit = competitorSeoAuditSkill
    tools.google_ecosystem = googleEcosystemSkill(orgId)
    tools.meta_ecosystem = metaEcosystemSkill(orgId)
    tools.crunchbase_research = crunchbaseResearchSkill
    tools.whitespace_finder = whitespaceFinderSkill
    tools.competitor_siphon = competitorSiphonSkill
  }

  // 6. CTO (Ghost)
  if (agentName === 'Ghost') {
    tools.validate_tech_architecture = validateTechArchitectureSkill
    tools.validate_seo_performance = validateSeoPerformanceSkill
    tools.microsoft_ecosystem = microsoftEcosystemSkill(orgId)
    tools.shodan_security_audit = shodanSecurityAuditSkill
    tools.mvp_scaffold = mvpScaffoldSkill
    tools.tech_stack_decider = techStackDeciderSkill
    if (connectedServices.includes('github')) {
      tools.github_create_pr = githubCreatePRSkill(orgId)
      tools.github_create_pull_request = githubCreatePRSkill(orgId)
    }
  }

  // Mount dynamic Google Workspace direct tools and their aliases globally
  if (connectedServices.includes('googlesheets') || connectedServices.includes('google_sheets')) {
    tools.google_sheets_update_sheet = googleEcosystemAdapter(orgId, 'sheets', 'update_sheet', 'Update rows/columns in Google Sheets.')
    tools.google_sheets_update = tools.google_sheets_update_sheet
    tools.google_sheets_create_row = tools.google_sheets_update_sheet
    tools.google_sheets_append_row = tools.google_sheets_update_sheet
  }
  if (connectedServices.includes('googledocs') || connectedServices.includes('google_docs')) {
    tools.google_docs_create_file = googleEcosystemAdapter(orgId, 'docs', 'create_file', 'Create new document in Google Docs.')
    tools.google_docs_create_document = tools.google_docs_create_file
    tools.google_docs_write_doc = tools.google_docs_create_file
  }
  if (connectedServices.includes('googlecalendar') || connectedServices.includes('google_calendar')) {
    tools.google_calendar_schedule_event = googleEcosystemAdapter(orgId, 'calendar', 'schedule_event', 'Schedule a meeting event in Google Calendar.')
    tools.google_calendar_create_event = tools.google_calendar_schedule_event
    tools.google_calendar_add_event = tools.google_calendar_schedule_event
  }
  if (connectedServices.includes('googledrive') || connectedServices.includes('google_drive')) {
    tools.google_drive_create_file = googleEcosystemAdapter(orgId, 'drive', 'create_file', 'Create or upload new files in Google Drive.')
    tools.google_drive_upload_file = tools.google_drive_create_file
  }
  if (connectedServices.includes('gmail') || connectedServices.includes('gmail_outreach')) {
    tools.google_gmail_send_email = googleEcosystemAdapter(orgId, 'gmail', 'send_email', 'Send outbound email alerts or marketing newsletters using Gmail.')
    tools.google_gmail_send_mail = tools.google_gmail_send_email
    tools.gmail_send_email = tools.google_gmail_send_email
    tools.gmail_outreach = tools.google_gmail_send_email
    tools.send_email = tools.google_gmail_send_email
  }

  // Mount dynamic Slack and Notion tools globally
  if (connectedServices.includes('slack')) {
    tools.slack_post = slackPostSkill(orgId)
    tools.slack_message = tools.slack_post
    tools.slack_chat_post_message = tools.slack_post
  }
  if (connectedServices.includes('notion')) {
    tools.notion_create_page = notionCreatePageSkill(orgId)
    tools.notion_post = tools.notion_create_page
  }

  // Mount dynamic HubSpot and GitHub tools globally
  if (connectedServices.includes('hubspot')) {
    tools.hubspot_create_deal = hubspotCreateDealSkill(orgId)
    tools.hubspot_deal = tools.hubspot_create_deal
    tools.create_deal = tools.hubspot_create_deal
  }
  if (connectedServices.includes('github')) {
    tools.github_create_pr = githubCreatePRSkill(orgId)
    tools.github_create_pull_request = tools.github_create_pr
    tools.create_pull_request = tools.github_create_pr
  }

  // Mount dynamic social platforms globally
  if (connectedServices.includes('linkedin')) {
    tools.linkedin_post = linkedinPostSkill(orgId)
    tools.linkedin_share = tools.linkedin_post
    tools.linkedin_create_post = tools.linkedin_post
  }
  if (connectedServices.includes('facebook')) {
    tools.facebook_post = facebookPostSkill(orgId)
    tools.facebook_create_post = tools.facebook_post
  }
  if (connectedServices.includes('pinterest')) {
    tools.pinterest_post = pinterestPostSkill(orgId)
    tools.pinterest_create_pin = tools.pinterest_post
  }
  if (connectedServices.includes('instagram')) {
    tools.instagram_post = instagramPostSkill(orgId)
    tools.instagram_create_media = tools.instagram_post
  }
  if (connectedServices.includes('twitter') || connectedServices.includes('x')) {
    tools.twitter_post = twitterPostSkill(orgId)
    tools.tweet_post = tools.twitter_post
    tools.create_tweet = tools.twitter_post
  }

  return tools
}
