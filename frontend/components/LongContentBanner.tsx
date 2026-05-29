'use client'

const QUICK_ACTIONS = [
  { label: 'Summarise it', instruction: 'Summarise the uploaded document concisely, highlighting the most important points.' },
  { label: 'Extract action items', instruction: 'Extract every action item from the uploaded document as a clear checklist.' },
  { label: 'Analyse for risks', instruction: 'Analyse the uploaded document for risks, blockers, and concerns.' },
  { label: 'Find opportunities', instruction: 'Identify strategic opportunities and upside in the uploaded document.' },
  { label: 'Write a response', instruction: 'Draft a professional response based on the uploaded document.' },
  { label: 'Custom...', instruction: '' },
] as const

type LongContentBannerProps = {
  wordCount: number
  onDismiss: () => void
  onChipClick: (instruction: string) => void
}

export default function LongContentBanner({ wordCount, onDismiss, onChipClick }: LongContentBannerProps) {
  return (
    <div className="mb-3 rounded-xl border border-primary-container/20 bg-[#121412]/90 backdrop-blur-md p-4 shadow-[0_8px_32px_rgba(0,0,0,0.35)] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-container flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">description</span>
            Long content attached
          </div>
          <p className="text-[10px] font-mono text-on-surface/50 mt-1 uppercase tracking-wider">
            {wordCount.toLocaleString()} words · input cleared for performance
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-on-surface/30 hover:text-on-surface transition-colors p-1"
          title="Remove attached document"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => onChipClick(action.instruction)}
            className="px-2.5 py-1.5 rounded-lg border border-outline-variant/15 bg-white/5 hover:bg-primary-container/10 hover:border-primary-container/30 text-[8px] font-black uppercase tracking-widest text-on-surface/70 hover:text-primary-container transition-all"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}
