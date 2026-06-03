import { ExternalLinkIcon } from '@/components/ui/ExternalLinkIcon'

interface ETWButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ETWButton({ className = '', size = 'md' }: ETWButtonProps) {
  const padding = size === 'sm' ? 'px-4 py-2' : size === 'lg' ? 'px-10 py-4' : 'px-6 py-2.5'
  return (
    <a
      href="https://www.elliottwavetrader.net/analyst/Luke-Miller"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 bg-lm-accent hover:bg-blue-600 text-white font-sans font-bold text-sm tracking-wide rounded-sm transition-colors ${padding} ${className}`}
    >
      Subscribe at EWT
      <ExternalLinkIcon className="w-3 h-3" />
    </a>
  )
}
