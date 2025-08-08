import * as React from "react"

import { useTranslation } from "../../i18n"
import { cn } from "../../lib/utils"
import { useScaledFont } from "../../hooks/use-scaled-font"

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    maxLength?: number
  }

const defaultMaxLength = {
  en: 500,
  fr: 400,
} as const

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, maxLength, ...props }, ref) => {
    const { lang } = useTranslation()
    const scaleFont = useScaledFont()
    const computedMax = maxLength ?? defaultMaxLength[lang]
    return (
      <textarea
        style={{ fontSize: scaleFont(14), ...style }}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        maxLength={computedMax}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
