'use client'

import DepartmentCard from './DepartmentCard'

const departments = [
  {
    id: 1,
    name: 'Sales Automation',
    icon: '📊',
    description: 'AI-powered lead generation, qualification, and conversion optimization',
  },
  {
    id: 2,
    name: 'Customer Support',
    icon: '💬',
    description: 'Intelligent chatbots and automated support ticket resolution 24/7',
  },
  {
    id: 3,
    name: 'HR & Recruitment',
    icon: '👥',
    description: 'Resume screening, interview scheduling, and employee onboarding automation',
  },
  {
    id: 4,
    name: 'Finance & Accounting',
    icon: '💰',
    description: 'Invoice processing, expense management, and financial forecasting',
  },
  {
    id: 5,
    name: 'Content Creation',
    icon: '✨',
    description: 'AI-generated marketing content, social media posts, and email campaigns',
  },
  {
    id: 6,
    name: 'Data Analytics',
    icon: '📈',
    description: 'Real-time insights, predictive analytics, and automated reporting',
  },
  {
    id: 7,
    name: 'Operations',
    icon: '⚙️',
    description: 'Workflow automation, inventory management, and supply chain optimization',
  },
  {
    id: 8,
    name: 'Legal & Compliance',
    icon: '⚖️',
    description: 'Contract analysis, compliance monitoring, and regulatory documentation',
  },
  {
    id: 9,
    name: 'Strategic Planning',
    icon: '🎯',
    description: 'Market analysis, competitive intelligence, and business strategy recommendations',
  },
]

export default function DepartmentsGrid() {
  return (
    <section className="min-h-screen relative px-4 py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block text-accent text-sm font-semibold tracking-widest uppercase mb-4">
            Nine Departments
          </span>
          <h2 className="font-syne text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Complete Business Automation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ORCA automates every critical department of your organization with specialized AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} {...dept} />
          ))}
        </div>
      </div>
    </section>
  )
}
