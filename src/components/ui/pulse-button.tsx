import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ViewStyle, TextStyle } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

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
    const { user } = useAuth();

    const variantStyle: ViewStyle =
      variant === 'pulse'
        ? { ...styles.pulse, backgroundColor: user?.pulseColor || styles.pulse.backgroundColor }
        : (styles as Record<string, ViewStyle>)[variant];

    const buttonStyle: ViewStyle[] = [
      styles.base,
      variantStyle,
      styles[size],
    ];

    const textStyle: TextStyle[] = [styles.text];

    if (variant === 'ghost') {
      textStyle.push(styles.textGhost);
    }

    let content: React.ReactNode = children;
    if (variant === 'pulse') {
      if (!content) {
        content = user?.pulseEmoji || '❤️';
      }
      if (user?.secretPulse) {
        content = user.secretPulseIcon || '❔';
      }
    }

    return (
      <TouchableOpacity ref={ref} style={[...buttonStyle, style]} {...props}>
        {typeof content === 'string' ? (
          <Text style={textStyle}>{content}</Text>
        ) : (
          content
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
