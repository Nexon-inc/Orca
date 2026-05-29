'use client'

type InChatQuestionCardProps = {
  question: string
  options: string[]
  onSelect: (option: string) => void
  disabled?: boolean
}

export default function InChatQuestionCard({ question, options, onSelect, disabled }: InChatQuestionCardProps) {
  return (
    <div className="mt-4 p-4 rounded-xl border border-primary-container/25 bg-gradient-to-br from-primary-container/10 to-transparent shadow-[0_0_24px_rgba(0,195,103,0.08)] backdrop-blur-sm">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-container mb-2 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">quiz</span>
        Quick choice
      </div>
      <p className="text-sm font-body text-on-surface mb-3 leading-relaxed">{question}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className="px-3 py-2 rounded-lg border border-primary-container/30 bg-primary-container/10 hover:bg-primary-container hover:text-on-primary text-[9px] font-black uppercase tracking-widest text-primary-container transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
