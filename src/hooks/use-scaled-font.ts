import { useCallback } from 'react'
import { PixelRatio } from 'react-native'

/**
 * Hook returning a function that scales a base font size using the current system font scale.
 */
export function useScaledFont() {
  const scale = PixelRatio.getFontScale()
  return useCallback((size: number) => size * scale, [scale])
}
