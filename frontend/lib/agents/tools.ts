import { tool } from 'ai'
import { z } from 'zod'
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

  return tools
}
