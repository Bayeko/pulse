# Font scaling

Components should respect the user's system font size settings. Use the `useScaledFont` hook to scale any base font size using `PixelRatio.getFontScale()`.

```tsx
import { useScaledFont } from '@/hooks/use-scaled-font'

const Example = () => {
  const scaleFont = useScaledFont()

  return <p style={{ fontSize: scaleFont(16) }}>Scaled text</p>
}
```

Avoid hard-coding `text-base` or other fixed font-size classes for core components. Prefer `useScaledFont` or relative units so text adapts to accessibility settings.
