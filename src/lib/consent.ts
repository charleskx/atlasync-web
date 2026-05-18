export type ConsentCategories = {
  necessary: true
  analytics: boolean
  performance: boolean
}

const CONSENT_KEY = 'lgpd_consent'

export function getConsent(): ConsentCategories | null {
  try {
    const stored = localStorage.getItem(CONSENT_KEY)
    if (!stored) return null
    return JSON.parse(stored) as ConsentCategories
  } catch {
    return null
  }
}

export function setConsent(consent: ConsentCategories) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent))
  window.dispatchEvent(new CustomEvent('lgpd:consent-changed', { detail: consent }))
}

export function hasConsent(): boolean {
  return getConsent() !== null
}

export function acceptAll() {
  setConsent({ necessary: true, analytics: true, performance: true })
}

export function rejectAll() {
  setConsent({ necessary: true, analytics: false, performance: false })
}
