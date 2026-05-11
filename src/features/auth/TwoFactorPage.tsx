import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth'
import { Button, OtpInput, useToast } from '../../components/ui'
import { I } from '../../components/icons'
import AuthAside from './AuthAside'

export default function TwoFactorPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { loginWithTotp } = useAuth()
  const { push } = useToast()
  const state = location.state as { tempToken?: string } | null

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length < 6) { setError('Insira o código de 6 dígitos.'); return }
    if (!state?.tempToken) { setError('Sessão expirada. Faça login novamente.'); return }
    setError('')
    setLoading(true)
    try {
      await loginWithTotp(state.tempToken, code)
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Código inválido'
      push({ title: 'Código inválido', desc: msg, tone: 'error' })
      setError(msg)
      setCode('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <AuthAside />
      <div className="auth-form-wrap">
        <form className="auth-form" style={{ textAlign: 'center' }} onSubmit={handleSubmit}>
          <div style={{ margin: '0 auto 16px', width: 56, height: 56, borderRadius: 14, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
            <I.shield size={24} />
          </div>
          <h1 className="h1">Verificação em duas etapas</h1>
          <div className="muted text-sm" style={{ marginTop: 6 }}>
            Insira o código gerado pelo seu app autenticador
          </div>
          <div style={{ margin: '28px 0 12px' }}>
            <OtpInput value={code} onChange={setCode} length={6} />
          </div>
          {error && (
            <div className="error-text" style={{ justifyContent: 'center' }}>
              <I.alert size={12} />{error}
            </div>
          )}
          <div className="auth-form-fields" style={{ marginTop: 16 }}>
            <Button variant="primary" size="lg" type="submit" disabled={loading || code.length < 6}>
              {loading ? 'Verificando…' : 'Verificar e entrar'}
            </Button>
            <span className="text-sm muted" style={{ cursor: 'pointer' }}>
              Usar código de recuperação
            </span>
          </div>
          <div className="auth-form-foot">
            <Link to="/login">← Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
