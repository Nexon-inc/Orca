'use client';

type ExecutiveThinkingPanelProps = {
  executiveRole: string;
  executiveIcon: string;
  executiveName: string;
  stepLabel: string;
  mode: string;
};

export default function ExecutiveThinkingPanel({
  executiveRole,
  executiveIcon,
  executiveName,
  stepLabel,
  mode,
}: ExecutiveThinkingPanelProps) {
  return (
    <div className="flex gap-4 mb-6 w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="relative flex-shrink-0 pt-1">
        <div className="absolute inset-0 rounded-2xl bg-primary-container/20 blur-md animate-pulse" />
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-container/30 to-primary-container/5 border border-primary-container/30 flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(0,195,103,0.15)]">
          {executiveIcon}
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary-container border-2 border-surface flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-on-primary animate-ping" />
        </div>
      </div>

      <div className="flex-1 min-w-0 rounded-3xl border border-primary-container/15 bg-gradient-to-br from-primary-container/[0.08] to-transparent p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-[10px] font-black font-headline text-primary-container uppercase tracking-[0.25em]">
            {executiveRole}
          </span>
          <span className="text-[9px] font-mono text-on-surface/30 uppercase tracking-widest">{executiveName}</span>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-primary-container/10 border border-primary-container/20 text-[8px] font-black uppercase tracking-widest text-primary-container/80">
            {mode}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary-container animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-sm font-headline font-bold text-on-surface/90 tracking-tight">
            {executiveName.split('(')[0].trim()} is working on your brief…
          </p>
        </div>

        <div className="rounded-2xl bg-black/20 border border-white/5 px-4 py-3 mb-4">
          <p className="text-[11px] font-mono text-primary-container/70 uppercase tracking-[0.12em] leading-relaxed">
            {stepLabel}
          </p>
        </div>

        <div className="h-1.5 w-full rounded-full bg-primary-container/10 overflow-hidden">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-primary-container/20 via-primary-container to-primary-container/20 animate-[shimmer_1.8s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

/** Build readable chat body — keeps directives visible (old split hid them). */
export function getAssistantDisplayContent(msg: any): string {
  const base = String(msg.content || '').trim();
  const directive = msg.metadata?.directive_raw?.trim();

  let text = base;
  if (directive) {
    const hasDirectiveInBody = /DIRECTIVE_DOCUMENT|MASTER_DIRECTIVE|DIRECTIVE:/i.test(base);
    if (!hasDirectiveInBody || base.length < 80) {
      text = base ? `${base}\n\n## Executive Directive\n\n${directive}` : `## Executive Directive\n\n${directive}`;
    }
  }

  text = text
    .replace(/\[ACTION:\s*tool=["'][^"']+["']\s*params=\{[\s\S]+?\}\]/gi, '')
    .replace(/\[HANDOFF:\s*to=["'][^"']+["']\s*reason=["'][^"']+["']\s*context=["'][^"']+["']\]/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/###\s*(.*?)(?:\n|$)/g, '$1\n')
    .replace(/##\s*(.*?)(?:\n|$)/g, '$1\n')
    .replace(/#\s*(.*?)(?:\n|$)/g, '$1\n')
    .trim();

  if (!text && directive) {
    text = directive;
  }

  return text;
}

export function assistantHasVisibleContent(msg: any): boolean {
  return getAssistantDisplayContent(msg).length > 0;
}
