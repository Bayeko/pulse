declare module '@sentry/react' {
  export function captureException(error: unknown, context?: unknown): void;
}
