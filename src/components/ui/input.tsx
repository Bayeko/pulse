import * as React from "react"

import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"
import { useScaledFont } from "@/hooks/use-scaled-font"

type InputProps = React.ComponentProps<"input"> & {
  maxLength?: number
}

const defaultMaxLength = {
  en: 100,
  fr: 80,
} as const

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, maxLength, ...props }, ref) => {
    const { lang } = useTranslation()
    const scaleFont = useScaledFont()
    const computedMax = maxLength ?? defaultMaxLength[lang]
    return (
      <input
        type={type}
        style={{ fontSize: scaleFont(16), ...style }}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        {...(type !== "file" ? { maxLength: computedMax } : {})}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
