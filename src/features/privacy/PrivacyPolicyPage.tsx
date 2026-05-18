import { Link } from 'react-router-dom'
import { CookieSettingsButton } from '../../components/CookieBanner'

const LAST_UPDATED = '17 de maio de 2025'
const COMPANY_NAME = 'MappaHub'
const COMPANY_EMAIL = 'privacidade@mappahub.com.br'
const DPO_EMAIL = 'dpo@mappahub.com.br'

export default function PrivacyPolicyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <Link to="/" className="privacy-back">← Voltar</Link>
          <h1>Política de Privacidade</h1>
          <p className="privacy-updated">Última atualização: {LAST_UPDATED}</p>
        </div>

        <div className="privacy-body">
          <section>
            <h2>1. Quem somos</h2>
            <p>
              A <strong>{COMPANY_NAME}</strong> ("<strong>nós</strong>", "<strong>nos</strong>" ou "
              <strong>nossa</strong>") é responsável pelo tratamento dos dados pessoais coletados por
              meio desta plataforma. Esta Política descreve como coletamos, usamos, armazenamos e
              protegemos seus dados pessoais, em conformidade com a{' '}
              <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei 13.709/2018)</strong>.
            </p>
            <p>
              <strong>E-mail de privacidade:</strong>{' '}
              <a href={`mailto:${COMPANY_EMAIL}`}>{COMPANY_EMAIL}</a>
            </p>
          </section>

          <section>
            <h2>2. Dados que coletamos</h2>

            <h3>2.1 Dados fornecidos por você</h3>
            <ul>
              <li><strong>Cadastro:</strong> nome completo, e-mail profissional, senha, nome da empresa e porte</li>
              <li><strong>Perfil:</strong> informações adicionais que você inserir em seu perfil</li>
              <li><strong>Parceiros:</strong> dados de localização, contato e atributos dos parceiros que você cadastra na plataforma</li>
              <li><strong>Comunicação:</strong> mensagens enviadas ao nosso suporte</li>
            </ul>

            <h3>2.2 Dados coletados automaticamente</h3>
            <ul>
              <li><strong>Dados de uso:</strong> páginas visitadas, cliques, tempo de sessão, funcionalidades utilizadas</li>
              <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, sistema operacional, resolução de tela</li>
              <li><strong>Logs de erro:</strong> erros e exceções técnicas para manutenção da plataforma</li>
              <li>
                <strong>Geolocalização:</strong> se você autorizar explicitamente no navegador,
                usamos sua localização para exibir parceiros próximos. Não armazenamos essa
                informação permanentemente.
              </li>
            </ul>

            <h3>2.3 Dados de terceiros</h3>
            <p>
              Se você se cadastrar com <strong>Login com Google</strong>, recebemos da Google seu
              nome, e-mail e foto de perfil, conforme autorizado por você na tela de consentimento
              do Google.
            </p>
          </section>

          <section>
            <h2>3. Finalidades e bases legais</h2>
            <table className="privacy-table">
              <thead>
                <tr>
                  <th>Finalidade</th>
                  <th>Base legal (LGPD)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Criação e gestão da sua conta</td>
                  <td>Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr>
                  <td>Prestação dos serviços da plataforma</td>
                  <td>Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr>
                  <td>Segurança e prevenção de fraudes</td>
                  <td>Legítimo interesse (art. 7º, IX)</td>
                </tr>
                <tr>
                  <td>Monitoramento de erros técnicos (Sentry)</td>
                  <td>Legítimo interesse (art. 7º, IX) / Consentimento (art. 7º, I)</td>
                </tr>
                <tr>
                  <td>Análise de uso e métricas (Google Analytics)</td>
                  <td>Consentimento (art. 7º, I)</td>
                </tr>
                <tr>
                  <td>Comunicações sobre a conta e cobranças</td>
                  <td>Execução de contrato (art. 7º, V)</td>
                </tr>
                <tr>
                  <td>Cumprimento de obrigações legais</td>
                  <td>Obrigação legal (art. 7º, II)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>4. Compartilhamento de dados</h2>
            <p>
              Não vendemos seus dados pessoais. Compartilhamos dados apenas com fornecedores que nos
              ajudam a operar a plataforma, todos vinculados por acordos de proteção de dados (DPA):
            </p>
            <ul>
              <li>
                <strong>Google Analytics</strong> — análise de uso da plataforma (somente com seu
                consentimento; dados anonimizados com IP mascarado).{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                  Política de privacidade do Google
                </a>
              </li>
              <li>
                <strong>Sentry</strong> — monitoramento de erros e desempenho técnico (somente com
                seu consentimento; texto e mídia mascarados).{' '}
                <a href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer">
                  Política de privacidade do Sentry
                </a>
              </li>
              <li>
                <strong>Google Maps Platform</strong> — exibição de mapas interativos. As
                coordenadas dos parceiros são enviadas ao Google para renderização do mapa.{' '}
                <a href="https://cloud.google.com/maps-platform/terms" target="_blank" rel="noopener noreferrer">
                  Termos do Google Maps
                </a>
              </li>
              <li>
                <strong>Google OAuth</strong> — autenticação via conta Google (opcional). Somente
                os dados autorizados por você na tela do Google são compartilhados conosco.
              </li>
              <li>
                <strong>Infraestrutura de hospedagem</strong> — servidores em nuvem onde a
                plataforma e os dados são armazenados.
              </li>
            </ul>
            <p>
              Poderemos divulgar dados pessoais quando exigido por lei, ordem judicial ou autoridade
              regulatória competente.
            </p>
          </section>

          <section>
            <h2>5. Cookies e tecnologias semelhantes</h2>
            <p>Usamos as seguintes categorias de cookies:</p>
            <table className="privacy-table">
              <thead>
                <tr>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Base legal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Necessários</strong></td>
                  <td>Autenticação, segurança da sessão e funcionamento básico. Não podem ser desativados.</td>
                  <td>Execução de contrato / Legítimo interesse</td>
                </tr>
                <tr>
                  <td><strong>Analíticos</strong></td>
                  <td>Google Analytics — mede o uso da plataforma de forma agregada.</td>
                  <td>Consentimento</td>
                </tr>
                <tr>
                  <td><strong>Desempenho</strong></td>
                  <td>Sentry — captura erros técnicos com dados mascarados.</td>
                  <td>Consentimento</td>
                </tr>
              </tbody>
            </table>
            <p>Você pode alterar suas preferências de cookies a qualquer momento:</p>
            <div style={{ marginTop: 8 }}>
              <CookieSettingsButton />
            </div>
          </section>

          <section>
            <h2>6. Retenção de dados</h2>
            <ul>
              <li><strong>Dados da conta ativa:</strong> mantidos enquanto a conta estiver ativa</li>
              <li><strong>Dados após encerramento da conta:</strong> excluídos em até 90 dias, salvo obrigação legal de retenção</li>
              <li><strong>Logs de segurança:</strong> mantidos por até 12 meses</li>
              <li><strong>Dados de analytics:</strong> retidos pelo Google Analytics por até 14 meses (configuração padrão reduzida)</li>
            </ul>
          </section>

          <section>
            <h2>7. Segurança dos dados</h2>
            <p>Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:</p>
            <ul>
              <li>Comunicação criptografada via HTTPS/TLS 1.2+</li>
              <li>Tokens de autenticação armazenados com proteção de sessão</li>
              <li>Acesso restrito por função (RBAC) a dados sensíveis</li>
              <li>Monitoramento contínuo de segurança</li>
            </ul>
            <p>
              Em caso de incidente de segurança que possa afetar seus dados, notificaremos você e a
              ANPD conforme exigido pela LGPD.
            </p>
          </section>

          <section>
            <h2>8. Seus direitos (LGPD, art. 18)</h2>
            <p>Você tem os seguintes direitos sobre seus dados pessoais:</p>
            <ul>
              <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e obter uma cópia</li>
              <li><strong>Correção:</strong> corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou eliminação:</strong> de dados desnecessários ou tratados em desconformidade</li>
              <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
              <li><strong>Eliminação:</strong> exclusão dos dados tratados com base em consentimento</li>
              <li><strong>Informação sobre compartilhamento:</strong> saber com quem compartilhamos seus dados</li>
              <li><strong>Revogação do consentimento:</strong> retirar seu consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> se opor ao tratamento em determinadas hipóteses</li>
            </ul>
            <p>
              Para exercer seus direitos, entre em contato com nosso Encarregado de Proteção de
              Dados (DPO):{' '}
              <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>. Responderemos em até 15 dias úteis.
            </p>
          </section>

          <section>
            <h2>9. Transferência internacional de dados</h2>
            <p>
              Alguns de nossos fornecedores (Google, Sentry) processam dados em servidores fora do
              Brasil. Essas transferências são realizadas com base em cláusulas contratuais padrão e
              mecanismos de adequação reconhecidos pela ANPD, garantindo nível de proteção
              equivalente ao exigido pela LGPD.
            </p>
          </section>

          <section>
            <h2>10. Menores de idade</h2>
            <p>
              A plataforma {COMPANY_NAME} é destinada exclusivamente a pessoas jurídicas e
              profissionais maiores de 18 anos. Não coletamos intencionalmente dados de menores de
              idade.
            </p>
          </section>

          <section>
            <h2>11. Alterações nesta política</h2>
            <p>
              Podemos atualizar esta Política periodicamente. Alterações significativas serão
              comunicadas por e-mail ou por aviso na plataforma. A data de "Última atualização" no
              topo indica quando a versão vigente foi publicada.
            </p>
          </section>

          <section>
            <h2>12. Contato e Encarregado de Dados (DPO)</h2>
            <p>
              Para dúvidas, exercício de direitos ou reclamações sobre privacidade, contate nosso
              Encarregado de Proteção de Dados:
            </p>
            <p>
              <strong>E-mail:</strong> <a href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a>
              <br />
              <strong>Prazo de resposta:</strong> até 15 dias úteis
            </p>
            <p>
              Você também pode apresentar reclamação à{' '}
              <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>:{' '}
              <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
                www.gov.br/anpd
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
