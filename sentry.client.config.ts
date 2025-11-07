let SentryClient: any = null
try {
  // Optional runtime-only import; avoids hard dependency in dev/build when not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  SentryClient = require('@sentry/nextjs')
} catch {}

if (SentryClient) {
  SentryClient.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production',
  })
}
