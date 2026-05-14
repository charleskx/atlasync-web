# Changelog

Todas as mudanças notáveis deste projeto serão documentadas aqui.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Unreleased]

## [1.0.0] - 2026-05-13

### Adicionado
- Tela de login com suporte a 2FA (TOTP)
- Registro de conta com tenant e plano trial automático
- Onboarding guiado após o primeiro acesso
- Dashboard com métricas de parceiros, importações e geocoding
- Listagem de parceiros com busca, filtros (visibilidade, tipo de pin, status geocoding, origem) e paginação
- Formulário de cadastro e edição de parceiros em sheet lateral
- Banner de falhas de geocoding na tela de parceiros
- Tela de logs de geocoding com detalhes por parceiro e atalho de edição de endereço
- Mapas interativos com Leaflet, clustering e seleção de parceiros
- Mapas públicos com embed via token
- Importação de parceiros via Excel com preview e histórico de jobs
- Exportação de parceiros em Excel
- Tipos de pin customizáveis com cor
- Gerenciamento de equipe com convites por e-mail
- Configurações de conta e perfil
- Faturamento com planos mensal e anual, troca via Stripe Customer Portal
- Subscription wall para contas canceladas/inadimplentes (login funciona, acesso restrito a faturamento e suporte)
- Integração de suporte via tickets com thread de mensagens
- Sino de notificações com badge de não lidas e navegação por tipo
- Super admin: gestão de tenants, histórico de imports, gerenciamento de 2FA por usuário
- Tema claro/escuro
- Sentry para captura de erros com session replay
