export const LinkedinIcon = ({ size = 28, strokeWidth = 2, className = "" }: { size?: number, strokeWidth?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

export const GithubIcon = ({ size = 28, strokeWidth = 2, className = "" }: { size?: number, strokeWidth?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.8 0-1.4-.5-2.8-1.5-3.8.1-.3.2-1.8-.1-3.8 0 0-1.2-.4-4 1.5-1.1-.3-2.3-.4-3.5-.4s-2.4.1-3.5.4c-2.8-1.9-4-1.5-4-1.5-.3 2-.2 3.5-.1 3.8-1 1-1.5 2.4-1.5 3.8 0 5.3 3 6.5 6 6.8-.5.4-.9 1.2-1 2.4-.3.2-1 .3-1.6-.1-.6-.4-1-1.4-1-1.4-.4-.7-1.1-1-1.1-1-.6-.1-.1-.1.1-.1.5.1 1 1 1 1 .6 1.1 1.7 1.1 2.3.8v2.4"/>
  </svg>
)
