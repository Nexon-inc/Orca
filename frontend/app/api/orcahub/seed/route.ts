import { createServiceSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createServiceSupabaseClient()

  const templates = [
    {
      slug: 'saas-startup',
      name: 'SaaS Startup',
      description: 'For solo founders and early-stage SaaS teams. Activates Marketing, Sales, Tech, and Ops with recommended agent modes and Day 1 briefs ready to go.',
      category: 'saas_startup',
      tags: ['startup','saas','founders'],
      template_data: {
        departments: [
          {key:'marketing',agent_mode:'approve_first',priority:'high',description:'Content, social, SEO',active_agents:['Aria','Jackie','Lucy']},
          {key:'sales',agent_mode:'approve_first',priority:'high',description:'Leads and outreach',active_agents:['Rex','Clara','Chase']},
          {key:'tech',agent_mode:'autopilot',priority:'medium',description:'Code security and DevOps',active_agents:['Ghost','Wren','Hex']},
          {key:'ops',agent_mode:'autopilot',priority:'medium',description:'Project management',active_agents:['Atlas','Cal','Dean']}
        ],
        suggested_integrations: ['github','notion','slack','google_calendar','linkedin','hubspot'],
        day1_briefs: [
          {agent_name:'Aria',brief:'Write 5 LinkedIn posts introducing our product. Founder tone. Include our waitlist link.',rationale:'Aria gets your social presence started immediately with content that attracts your ICP.'},
          {agent_name:'Rex',brief:'Find 20 founders in our ICP who have posted about operational challenges in the last 30 days.',rationale:'Rex builds your first lead pipeline with warm, high-intent prospects.'},
          {agent_name:'Ghost',brief:'Scan our main repository for security vulnerabilities. Report any critical issues immediately.',rationale:'Ghost catches security issues before they become production problems.'},
          {agent_name:'Atlas',brief:'Create a launch week project plan with daily tasks for the next 7 days.',rationale:'Atlas gives structure to your first week so nothing falls through the cracks.'}
        ]
      },
      author: 'orca_official',
      plan_required: 'starter',
      published: true
    },
    {
      slug: 'content-marketing-agency',
      name: 'Content Marketing Agency',
      description: 'For agencies running content, SEO, and social for multiple clients. Activates Marketing, Intelligence, Community, and Ops.',
      category: 'marketing_agency',
      tags: ['agency','marketing','content','seo'],
      template_data: {
        departments: [
          {key:'marketing',agent_mode:'approve_first',priority:'high',description:'Content, social, SEO, ads',active_agents:['Aria','Jackie','Eric','Lucy']},
          {key:'intel',agent_mode:'autopilot',priority:'medium',description:'Competitor and market research',active_agents:['Roman','Sage','Nate']},
          {key:'community',agent_mode:'approve_first',priority:'medium',description:'Partnerships and growth',active_agents:['Milo','Rio','Spike']},
          {key:'ops',agent_mode:'autopilot',priority:'low',description:'Project and task management',active_agents:['Atlas','Dean','Iris']}
        ],
        suggested_integrations: ['linkedin','twitter','wordpress','google_analytics','ahrefs','notion','slack'],
        day1_briefs: [
          {agent_name:'Jackie',brief:'Write a 1,200-word blog post about the top 5 AI tools for small business owners. SEO-optimised, professional tone.',rationale:'Jackie produces your first piece of content immediately — sets the quality bar.'},
          {agent_name:'Lucy',brief:'Run an SEO audit of our main website. Report the top 10 on-page issues to fix this week.',rationale:'Lucy identifies quick wins that improve organic visibility without new content.'},
          {agent_name:'Roman',brief:'Research our top 5 competitors. Summarise their content strategy, publishing frequency, and top performing topics.',rationale:'Roman builds the competitive intelligence your whole team will reference.'},
          {agent_name:'Sage',brief:'Monitor our brand name and top 3 competitors on LinkedIn, X, and Reddit for the next 30 days.',rationale:'Sage keeps you informed of market movements without manual searching.'}
        ]
      },
      author: 'orca_official',
      plan_required: 'starter',
      published: true
    },
    {
      slug: 'ecommerce-operator',
      name: 'E-commerce Operator',
      description: 'For DTC brands and online stores. Activates Marketing, Sales, Customer Success, and Finance with an e-commerce focus.',
      category: 'ecommerce',
      tags: ['ecommerce','dtc','retail','shopify'],
      template_data: {
        departments: [
          {key:'marketing',agent_mode:'approve_first',priority:'high',description:'Ads, social, email',active_agents:['Aria','Eric','Jackie']},
          {key:'sales',agent_mode:'autopilot',priority:'high',description:'Lead gen and pipeline',active_agents:['Rex','Clara','Chase']},
          {key:'cs',agent_mode:'autopilot',priority:'high',description:'Support and retention',active_agents:['Purity','Bruce','Nadia']},
          {key:'finance',agent_mode:'approve_first',priority:'medium',description:'Invoicing and expenses',active_agents:['Bill','Felix','Reid']}
        ],
        suggested_integrations: ['meta','mailchimp','stripe_revenue','intercom','google_analytics'],
        day1_briefs: [
          {agent_name:'Aria',brief:'Write 5 Instagram captions for our product launch campaign. Bold, energetic tone. Include a call to action.',rationale:'Aria kick-starts your social presence for the launch.'},
          {agent_name:'Eric',brief:'Write 3 Facebook ad copy variants for our best-selling product. Pain-solution format. Audience: 25-40, online shoppers.',rationale:'Eric creates ad copy variants ready to test immediately.'},
          {agent_name:'Purity',brief:'Create an FAQ document for our 10 most common customer support questions.',rationale:'Purity builds a knowledge base that reduces support volume from day one.'},
          {agent_name:'Bill',brief:'Set up an invoice template for our standard product orders including terms and payment details.',rationale:'Bill creates a professional invoice template you can use immediately.'}
        ]
      },
      author: 'orca_official',
      plan_required: 'starter',
      published: true
    },
    {
      slug: 'recruiting-firm',
      name: 'Recruiting Firm',
      description: 'For boutique recruitment agencies. Activates People & Hiring, Sales, Intelligence, and Ops with a hiring-first setup.',
      category: 'recruiting_firm',
      tags: ['recruiting','hiring','hr','talent'],
      template_data: {
        departments: [
          {key:'hiring',agent_mode:'approve_first',priority:'high',description:'Sourcing, screening, verification',active_agents:['Marcus','Vera','Zara','Eli']},
          {key:'sales',agent_mode:'approve_first',priority:'high',description:'Client prospecting and outreach',active_agents:['Rex','Mark','Clara']},
          {key:'intel',agent_mode:'autopilot',priority:'medium',description:'Market and company research',active_agents:['Roman','Sage','Nate']},
          {key:'ops',agent_mode:'autopilot',priority:'low',description:'Task and calendar management',active_agents:['Atlas','Cal','Dean']}
        ],
        suggested_integrations: ['linkedin_hiring','workable','gmail_outreach','hubspot','notion'],
        day1_briefs: [
          {agent_name:'Marcus',brief:'Source 10 senior software engineering candidates who are open to work and based in East Africa.',rationale:'Marcus fills your first candidate pipeline immediately.'},
          {agent_name:'Vera',brief:'Create a screening scorecard for senior software engineers including technical skills and culture fit criteria.',rationale:'Vera standardises your screening process from day one.'},
          {agent_name:'Rex',brief:'Find 10 fast-growing startups in East Africa that are likely hiring engineers in the next 90 days.',rationale:'Rex builds your client prospect list with companies actively in hiring mode.'},
          {agent_name:'Zara',brief:'Create a background verification checklist for candidates including employment history, references, and identity verification.',rationale:'Zara creates a repeatable verification process before your first placement.'}
        ]
      },
      author: 'orca_official',
      plan_required: 'starter',
      published: true
    },
    {
      slug: 'dev-agency',
      name: 'Dev Agency',
      description: 'For software development agencies. Activates Tech, Ops, Sales, and Finance with a developer-first configuration.',
      category: 'dev_agency',
      tags: ['dev','agency','software','engineering'],
      template_data: {
        departments: [
          {key:'tech',agent_mode:'approve_first',priority:'high',description:'Code reviews, security, DevOps, docs',active_agents:['Ghost','Cipher','Wren','Hex']},
          {key:'ops',agent_mode:'autopilot',priority:'high',description:'Project management and coordination',active_agents:['Atlas','Dean','Iris','Owen']},
          {key:'sales',agent_mode:'approve_first',priority:'medium',description:'Client prospecting and pipeline',active_agents:['Rex','Clara','Mark']},
          {key:'finance',agent_mode:'approve_first',priority:'medium',description:'Invoicing and contracts',active_agents:['Bill','Lena','Reid']}
        ],
        suggested_integrations: ['github','linear','vercel','hubspot','notion','stripe_revenue','docusign'],
        day1_briefs: [
          {agent_name:'Cipher',brief:'Review our GitHub repository structure and suggest improvements to our code review and PR approval process.',rationale:'Cipher establishes code quality standards before the next PR.'},
          {agent_name:'Hex',brief:'Create a README template for our client project repositories including setup instructions and contribution guidelines.',rationale:'Hex creates a professional documentation standard your whole team uses.'},
          {agent_name:'Rex',brief:'Find 10 funded startups that recently announced a product launch and likely need development support.',rationale:'Rex builds a warm prospect list of companies in active build mode.'},
          {agent_name:'Lena',brief:'Draft a standard software development contract template including scope, payment terms, IP ownership, and termination clauses.',rationale:'Lena creates a legally sound contract template you can customise per client.'}
        ]
      },
      author: 'orca_official',
      plan_required: 'starter',
      published: true
    },
    {
      slug: 'intelligence-research-desk',
      name: 'Intelligence & Research Desk',
      description: 'For research teams and think tanks. Activates Intelligence, Community, and Ops for deep market and competitive research.',
      category: 'intelligence',
      tags: ['research','intelligence','competitive','analysis'],
      template_data: {
        departments: [
          {key:'intel',agent_mode:'autopilot',priority:'high',description:'Research, signals, summaries, forecasting',active_agents:['Roman','Sage','Nate','Ada','Dex']},
          {key:'community',agent_mode:'approve_first',priority:'medium',description:'Community and partnerships',active_agents:['Milo','Rio','Spike']},
          {key:'ops',agent_mode:'autopilot',priority:'low',description:'Notes and project management',active_agents:['Atlas','Dean','Iris']}
        ],
        suggested_integrations: ['perplexity','semrush','ahrefs','notion','slack'],
        day1_briefs: [
          {agent_name:'Roman',brief:'Research the AI Company OS market. Identify all key players, their positioning, pricing models, and target customers.',rationale:'Roman builds the foundational competitive intelligence your whole team will reference.'},
          {agent_name:'Sage',brief:'Set up monitoring for AI agents, AI company OS, and multi-agent systems on LinkedIn, X, and Reddit.',rationale:'Sage keeps continuous watch on the market so you never miss a signal.'},
          {agent_name:'Nate',brief:'Create a weekly intelligence brief template with sections for market movements, competitor updates, and key takeaways.',rationale:'Nate builds the brief format your team will use every week.'},
          {agent_name:'Ada',brief:'Build a 6-month growth forecast model for the AI tools market segment including TAM estimate and growth rate assumptions.',rationale:'Ada gives your research a quantitative foundation for strategic planning.'}
        ]
      },
      author: 'orca_official',
      plan_required: 'starter',
      published: true
    }
  ]

  // Delete existing rows first to avoid conflicts, then re-insert cleanly
  await supabase.from('orcahub_templates').delete().in('slug', templates.map(t => t.slug))

  const { error } = await supabase
    .from('orcahub_templates')
    .insert(templates)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, seeded: templates.length })
}
