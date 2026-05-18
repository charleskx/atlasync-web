import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { acceptAll, getConsent, hasConsent, rejectAll, setConsent } from '../lib/consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [performance, setPerformance] = useState(true)

  useEffect(() => {
    if (!hasConsent()) setVisible(true)
  }, [])

  if (!visible) return null

  const handleAcceptAll = () => {
    acceptAll()
    setVisible(false)
  }

  const handleRejectAll = () => {
    rejectAll()
    setVisible(false)
  }

  const handleSave = () => {
    setConsent({ necessary: true, analytics, performance })
    setVisible(false)
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Preferências de privacidade">
      <div className="cookie-banner-content">
        <div className="cookie-banner-header">
          <strong>Seus dados, suas escolhas</strong>
          <button
            className="cookie-banner-expand"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            {expanded ? 'Menos opções' : 'Personalizar'}
          </button>
        </div>
        <p className="cookie-banner-text">
          Usamos cookies e tecnologias semelhantes para garantir o funcionamento da plataforma, medir
          o desempenho e melhorar sua experiência. Em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, você pode escolher quais
          categorias aceita.{' '}
          <Link to="/privacy-policy" className="cookie-banner-link" target="_blank">
            Política de Privacidade
          </Link>
        </p>

        {expanded && (
          <div className="cookie-banner-categories">
            <label className="cookie-category">
              <div className="cookie-category-info">
                <span className="cookie-category-name">Necessários</span>
                <span className="cookie-category-desc">
                  Autenticação, segurança e funcionamento básico da plataforma. Sempre ativos.
                </span>
              </div>
              <span className="cookie-toggle cookie-toggle--always-on">Sempre ativo</span>
            </label>

            <label className="cookie-category">
              <div className="cookie-category-info">
                <span className="cookie-category-name">Analíticos</span>
                <span className="cookie-category-desc">
                  Google Analytics — nos ajuda a entender como a plataforma é usada, de forma
                  agregada e anônima.
                </span>
              </div>
              <input
                type="checkbox"
                className="cookie-toggle-check"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />
            </label>

            <label className="cookie-category">
              <div className="cookie-category-info">
                <span className="cookie-category-name">Desempenho</span>
                <span className="cookie-category-desc">
                  Sentry — monitoramento de erros e performance para manter a plataforma estável.
                  Dados anonimizados.
                </span>
              </div>
              <input
                type="checkbox"
                className="cookie-toggle-check"
                checked={performance}
                onChange={(e) => setPerformance(e.target.checked)}
              />
            </label>
          </div>
        )}

        <div className="cookie-banner-actions">
          {expanded ? (
            <button className="btn btn-primary cookie-btn" onClick={handleSave}>
              Salvar preferências
            </button>
          ) : (
            <button className="btn btn-primary cookie-btn" onClick={handleAcceptAll}>
              Aceitar todos
            </button>
          )}
          <button className="btn btn-outline cookie-btn" onClick={handleRejectAll}>
            Rejeitar não essenciais
          </button>
        </div>
      </div>
    </div>
  )
}

export function CookieSettingsButton() {
  const [visible, setVisible] = useState(false)
  const [analytics, setAnalytics] = useState(() => getConsent()?.analytics ?? true)
  const [performance, setPerformance] = useState(() => getConsent()?.performance ?? true)

  if (!visible) {
    return (
      <button
        className="btn btn-ghost"
        style={{ fontSize: 13 }}
        onClick={() => {
          const c = getConsent()
          setAnalytics(c?.analytics ?? true)
          setPerformance(c?.performance ?? true)
          setVisible(true)
        }}
      >
        Preferências de cookies
      </button>
    )
  }

  return (
    <div className="cookie-banner" role="dialog" aria-label="Preferências de privacidade">
      <div className="cookie-banner-content">
        <div className="cookie-banner-header">
          <strong>Preferências de cookies</strong>
          <button className="cookie-banner-expand" onClick={() => setVisible(false)}>
            Fechar
          </button>
        </div>

        <div className="cookie-banner-categories">
          <label className="cookie-category">
            <div className="cookie-category-info">
              <span className="cookie-category-name">Necessários</span>
              <span className="cookie-category-desc">Autenticação e funcionamento básico.</span>
            </div>
            <span className="cookie-toggle cookie-toggle--always-on">Sempre ativo</span>
          </label>

          <label className="cookie-category">
            <div className="cookie-category-info">
              <span className="cookie-category-name">Analíticos</span>
              <span className="cookie-category-desc">Google Analytics — uso agregado e anônimo.</span>
            </div>
            <input
              type="checkbox"
              className="cookie-toggle-check"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />
          </label>

          <label className="cookie-category">
            <div className="cookie-category-info">
              <span className="cookie-category-name">Desempenho</span>
              <span className="cookie-category-desc">Sentry — monitoramento de erros.</span>
            </div>
            <input
              type="checkbox"
              className="cookie-toggle-check"
              checked={performance}
              onChange={(e) => setPerformance(e.target.checked)}
            />
          </label>
        </div>

        <div className="cookie-banner-actions">
          <button
            className="btn btn-primary cookie-btn"
            onClick={() => {
              setConsent({ necessary: true, analytics, performance })
              setVisible(false)
            }}
          >
            Salvar
          </button>
          <button className="btn btn-outline cookie-btn" onClick={() => setVisible(false)}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
