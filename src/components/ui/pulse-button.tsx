import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const pulseButtonVariants = cva(
  "relative overflow-hidden transition-all duration-300 font-medium",
  {
    variants: {
      variant: {
        pulse: "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-[0_0_40px_hsl(var(--primary-glow)/_0.8)] animate-pulse-glow",
        ghost: "bg-transparent text-primary hover:bg-primary/10 border border-primary/20",
        soft: "bg-primary-soft text-foreground hover:bg-primary/20",
        intimate: "bg-gradient-card text-foreground shadow-card hover:shadow-glow border border-primary/20"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-lg",
        xl: "h-16 px-10 py-5 text-xl"
      }
    },
    defaultVariants: {
      variant: "pulse",
      size: "default"
    }
  }
);

export interface PulseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof pulseButtonVariants> {
  asChild?: boolean;
}

const PulseButton = React.forwardRef<HTMLButtonElement, PulseButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? "span" : "button";
    
    return (
      <Button
        className={cn(pulseButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        asChild={asChild}
      >
        <Comp>
          {children}
          {variant === "pulse" && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
          )}
        </Comp>
      </Button>
    );
  }
);

PulseButton.displayName = "PulseButton";

export { PulseButton, pulseButtonVariants };