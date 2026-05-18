import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/auth'
import AppRouter from './router'
import { ToastProvider } from './components/ui'
import CookieBanner from './components/CookieBanner'
import { disableAnalytics, initAnalytics, trackPageView } from './config/analytics'
import { getConsent, type ConsentCategories } from './lib/consent'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
})

function applyConsent(consent: ConsentCategories) {
  if (consent.analytics) {
    initAnalytics()
  } else {
    disableAnalytics()
  }
}

function PageViewTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname + location.search)
  }, [location])
  return null
}

export default function App() {
  useEffect(() => {
    // Apply consent that was already saved (returning visitors)
    const consent = getConsent()
    if (consent) applyConsent(consent)

    const handler = (e: Event) => {
      applyConsent((e as CustomEvent<ConsentCategories>).detail)
    }
    window.addEventListener('lgpd:consent-changed', handler)
    return () => window.removeEventListener('lgpd:consent-changed', handler)
  }, [])

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <PageViewTracker />
            <AppRouter />
            <CookieBanner />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  )
}
