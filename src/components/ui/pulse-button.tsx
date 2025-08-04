import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';

export type PulseButtonVariant = 'pulse' | 'ghost' | 'soft' | 'intimate';
export type PulseButtonSize = 'default' | 'sm' | 'lg' | 'xl';

export interface PulseButtonProps extends TouchableOpacityProps {
  variant?: PulseButtonVariant;
  size?: PulseButtonSize;
  className?: string; // For nativewind compatibility
  children: React.ReactNode;
  asChild?: boolean;
}

const PulseButton = React.forwardRef<TouchableOpacity, PulseButtonProps>(
  ({ variant = 'pulse', size = 'default', style, children, asChild, ...props }, ref) => {
    const buttonStyle: ViewStyle[] = [
      styles.base,
      styles[variant],
      styles[size],
    ];

    const textStyle: TextStyle[] = [styles.text];

    if (variant === 'ghost') {
      textStyle.push(styles.textGhost);
    }

    return (
      <TouchableOpacity ref={ref} style={[...buttonStyle, style]} {...props}>
        {typeof children === 'string' ? (
          <Text style={textStyle}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

PulseButton.displayName = 'PulseButton';

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    backgroundColor: '#ff0066',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff0066',
  },
  soft: {
    backgroundColor: '#fde6ef',
  },
  intimate: {
    backgroundColor: '#e5e7eb',
  },
  default: {
    height: 48,
    paddingHorizontal: 24,
  },
  sm: {
    height: 40,
    paddingHorizontal: 16,
  },
  lg: {
    height: 56,
    paddingHorizontal: 32,
  },
  xl: {
    height: 64,
    paddingHorizontal: 40,
  },
  text: {
    color: '#ffffff',
    fontWeight: '500',
  },
  textGhost: {
    color: '#ff0066',
  },
});

export { PulseButton };
