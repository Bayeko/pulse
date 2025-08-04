import React from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps extends React.SVGProps<SVGSVGElement> {
  progress: number
  size?: number
  strokeWidth?: number
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 24,
  strokeWidth = 4,
  className,
  ...props
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  const gradientId = React.useId()

  return (
    <svg
      width={size}
      height={size}
      className={cn("rotate-[-90deg]", className)}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary-glow))" />
        </linearGradient>
      </defs>
      <circle
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
        className="drop-shadow-[0_0_4px_hsl(var(--primary-glow)/0.5)] transition-all"
      />
    </svg>
  )
}

export { ProgressRing }

