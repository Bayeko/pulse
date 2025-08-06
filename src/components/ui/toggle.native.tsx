import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';

export type ToggleProps = PressableProps & { children?: React.ReactNode };

export const Toggle = ({ children, ...props }: ToggleProps) => (
  <Pressable {...props}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </Pressable>
);

export const toggleVariants = () => '';
