import * as Sentry from '@sentry/react'
import { getConsent } from '../lib/consent'

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  const consent = getConsent()
  const performanceConsent = consent?.performance ?? false

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [
      Sentry.browserTracingIntegration(),
      // Session replay only with explicit performance consent
      ...(performanceConsent
        ? [
            Sentry.replayIntegration({
              maskAllText: true,
              blockAllMedia: true,
            }),
          ]
        : []),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
    replaysSessionSampleRate: performanceConsent ? 0.1 : 0,
    replaysOnErrorSampleRate: performanceConsent ? 1.0 : 0,
  })
}

// Re-initialize Sentry when user updates consent preferences
window.addEventListener('lgpd:consent-changed', () => {
  initSentry()
})

export { Sentry }
