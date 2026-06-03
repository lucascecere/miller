export function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`py-20 lg:py-28 ${className}`}>
      {children}
    </section>
  )
}
