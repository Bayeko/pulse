import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';

export type ButtonProps = PressableProps & { children?: React.ReactNode };

export const Button = ({ children, ...props }: ButtonProps) => (
  <Pressable {...props}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </Pressable>
);

export const buttonVariants = () => '';
