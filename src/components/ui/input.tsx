import * as React from "react"

import { useTranslation } from "@/i18n"
import { cn } from "@/lib/utils"

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
    const computedMax = maxLength ?? defaultMaxLength[lang]
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
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
