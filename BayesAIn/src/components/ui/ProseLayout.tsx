export function ProseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 prose prose-invert
      prose-headings:font-serif prose-headings:text-lm-cream
      prose-p:text-lm-cream-muted prose-p:leading-relaxed
      prose-a:text-lm-accent prose-a:no-underline hover:prose-a:underline
      prose-strong:text-lm-cream
      prose-code:text-lm-cream prose-code:bg-lm-surface prose-code:px-1 prose-code:rounded
      prose-pre:bg-lm-surface prose-pre:border prose-pre:border-lm-border
      prose-blockquote:border-lm-accent prose-blockquote:text-lm-cream-muted
      prose-hr:border-lm-border
      prose-li:text-lm-cream-muted">
      {children}
    </div>
  )
}
