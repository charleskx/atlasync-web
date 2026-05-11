import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button, useToast } from '../../components/ui'
import { I } from '../../components/icons'
import AuthAside from './AuthAside'

export default function VerifyEmailPage() {
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { push } = useToast()
  const token = params.get('token')
  const email = (location.state as { email?: string })?.email ?? ''

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) return
    setStatus('verifying')
    api.auth
      .verifyEmail(token)
      .then(() => {
        setStatus('success')
        push({ title: 'E-mail verificado!', desc: 'Sua conta está ativa.', tone: 'success' })
        setTimeout(() => navigate('/login'), 2000)
      })
      .catch(() => {
        setStatus('error')
        push({ title: 'Link inválido', desc: 'O link expirou ou já foi usado.', tone: 'error' })
      })
  }, [token, navigate, push])

  const resend = async () => {
    if (!email) return
    setResending(true)
    try {
      await api.auth.resendVerification(email)
      push({ title: 'E-mail reenviado', tone: 'success' })
    } catch {
      push({ title: 'Erro ao reenviar', tone: 'error' })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="auth-page">
      <AuthAside />
      <div className="auth-form-wrap">
        <div className="auth-form" style={{ textAlign: 'center' }}>
          {status === 'verifying' && (
            <>
              <div className="skel" style={{ width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px' }} />
              <h1 className="h1">Verificando…</h1>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ margin: '0 auto 16px', width: 56, height: 56, borderRadius: 14, background: 'var(--success-soft)', color: 'var(--success)', display: 'grid', placeItems: 'center' }}>
                <I.check size={28} />
              </div>
              <h1 className="h1">E-mail verificado!</h1>
              <div className="muted text-sm" style={{ marginTop: 6 }}>Redirecionando para o login…</div>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ margin: '0 auto 16px', width: 56, height: 56, borderRadius: 14, background: 'var(--danger-soft)', color: 'var(--danger)', display: 'grid', placeItems: 'center' }}>
                <I.alert size={28} />
              </div>
              <h1 className="h1">Link inválido</h1>
              <div className="muted text-sm" style={{ marginTop: 6 }}>O link expirou ou já foi utilizado.</div>
              {email && (
                <div className="auth-form-fields" style={{ marginTop: 20 }}>
                  <Button variant="primary" size="lg" onClick={resend} disabled={resending}>
                    {resending ? 'Reenviando…' : 'Reenviar e-mail'}
                  </Button>
                </div>
              )}
            </>
          )}

          {status === 'idle' && (
            <>
              <div style={{ margin: '0 auto 16px', width: 56, height: 56, borderRadius: 14, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center' }}>
                <I.mail size={24} />
              </div>
              <h1 className="h1">Confirme seu e-mail</h1>
              <div className="muted text-sm" style={{ marginTop: 6 }}>
                Enviamos um link de confirmação para{' '}
                <span className="mono" style={{ color: 'var(--fg)' }}>{email}</span>
              </div>
              <div className="auth-form-fields" style={{ marginTop: 20 }}>
                <Button variant="primary" size="lg" onClick={() => navigate('/onboarding')}>
                  Já confirmei, continuar
                </Button>
                {email && (
                  <Button variant="ghost" onClick={resend} disabled={resending}>
                    {resending ? 'Reenviando…' : 'Reenviar e-mail'}
                  </Button>
                )}
              </div>
            </>
          )}

          <div className="auth-form-foot" style={{ marginTop: 24 }}>
            <Link to="/login">← Voltar para o login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
