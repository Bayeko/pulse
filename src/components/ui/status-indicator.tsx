import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslation } from '@/i18n';

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 font-medium transition-all duration-300",
  {
    variants: {
      status: {
        active: "text-pulse-active",
        away: "text-pulse-away", 
        offline: "text-pulse-offline"
      },
      size: {
        sm: "text-xs",
        default: "text-sm",
        lg: "text-base"
      }
    },
    defaultVariants: {
      status: "offline",
      size: "default"
    }
  }
);

const pulseVariants = cva(
  "rounded-full transition-all duration-300",
  {
    variants: {
      status: {
        active: "bg-pulse-active animate-pulse-glow",
        away: "bg-pulse-away",
        offline: "bg-pulse-offline"
      },
      size: {
        sm: "w-2 h-2",
        default: "w-3 h-3", 
        lg: "w-4 h-4"
      }
    },
    defaultVariants: {
      status: "offline",
      size: "default"
    }
  }
);

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  label?: string;
  showPulse?: boolean;
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, status, size, label, showPulse = true, ...props }, ref) => {
    const { t } = useTranslation();
    const getStatusLabel = () => {
      if (label) return label;
      switch (status) {
        case 'active':
          return t('statusReady');
        case 'away':
          return t('statusAway');
        case 'offline':
          return t('statusOffline');
        default:
          return t('statusUnknown');
      }
    };

    return (
      <div
        className={cn(statusIndicatorVariants({ status, size, className }))}
        ref={ref}
        {...props}
      >
        {showPulse && (
          <div className={cn(pulseVariants({ status, size }))} />
        )}
        <span>{getStatusLabel()}</span>
      </div>
    );
  }
);

StatusIndicator.displayName = "StatusIndicator";

export { StatusIndicator, statusIndicatorVariants };
