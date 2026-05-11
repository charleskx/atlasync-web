import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button, Card, Field, Input, useToast } from '../../components/ui'
import { I } from '../../components/icons'
import AuthAside from './AuthAside'

export default function ForgotPage() {
  const { push } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.auth.forgotPassword(email)
      setSent(true)
      push({ title: 'E-mail enviado', desc: 'Verifique sua caixa de entrada.', tone: 'success' })
    } catch {
      push({ title: 'Erro', desc: 'Não foi possível enviar o e-mail.', tone: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <AuthAside />
      <div className="auth-form-wrap">
        <div className="auth-form">
          <h1 className="h1">{sent ? 'Verifique seu e-mail' : 'Recuperar senha'}</h1>
          <div className="muted text-sm">
            {sent
              ? 'Enviamos um link para redefinir sua senha.'
              : 'Te enviaremos um link de redefinição.'}
          </div>
          <div className="auth-form-fields">
            {!sent ? (
              <>
                <Field label="E-mail">
                  <Input
                    icon={<I.mail />}
                    type="email"
                    placeholder="voce@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </Field>
                <Button variant="primary" size="lg" type="submit" disabled={loading} onClick={handleSubmit as unknown as React.MouseEventHandler}>
                  {loading ? 'Enviando…' : 'Enviar link'}
                </Button>
              </>
            ) : (
              <>
                <Card style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="empty-icon" style={{ margin: 0, width: 36, height: 36 }}>
                    <I.mail />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>Link enviado</div>
                    <div className="muted text-sm" style={{ marginTop: 2 }}>
                      Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                    </div>
                  </div>
                </Card>
                <Button variant="outline" onClick={() => setSent(false)}>
                  Reenviar
                </Button>
              </>
            )}
          </div>
          <div className="auth-form-foot">
            <Link to="/login">← Voltar para o login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
