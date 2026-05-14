# Deploy na Vercel — Guia Passo a Passo

O deploy acontece **somente ao criar uma tag de versão**. Push na `main` não faz deploy automaticamente.

---

## 1. Criar o projeto na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em **Add New → Project**
3. Importe o repositório `mappahub-web` do GitHub
4. Na tela de configuração:
   - **Framework Preset**: Vite (detectado automaticamente)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Não clique em Deploy ainda** — primeiro desative o deploy automático

---

## 2. Desativar deploy automático da Vercel

Por padrão a Vercel faz deploy a cada push. Desative isso:

1. No projeto da Vercel → **Settings → Git**
2. Em **"Ignored Build Step"**, adicione o comando:
   ```bash
   exit 1
   ```
   Isso faz a Vercel ignorar **todos** os triggers automáticos de Git. O deploy só acontecerá via GitHub Actions (que chama a CLI da Vercel diretamente).

---

## 3. Coletar os IDs necessários

### Token da Vercel

1. Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Clique em **Create** → dê o nome `mappahub-deploy`
3. Copie o token gerado — ele só aparece uma vez

### Organization ID e Project ID

1. No terminal, instale a CLI da Vercel:
   ```bash
   npm install -g vercel
   ```
2. Dentro da pasta do projeto, execute:
   ```bash
   vercel link
   ```
   Siga as instruções para linkar ao projeto existente.
3. Após o link, os IDs ficam em `.vercel/project.json`:
   ```json
   {
     "orgId": "team_XXXXXXXX",
     "projectId": "prj_XXXXXXXX"
   }
   ```
   Copie os dois valores.

---

## 4. Configurar os Secrets no GitHub

No repositório do GitHub → **Settings → Secrets and variables → Actions → New repository secret**.

Adicione os seguintes secrets:

| Secret | Valor |
|--------|-------|
| `VERCEL_TOKEN` | Token gerado no passo 3 |
| `VERCEL_ORG_ID` | `orgId` do `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `projectId` do `.vercel/project.json` |
| `VITE_API_URL` | URL da API em produção (ex: `https://api.mappahub.com.br`) |
| `VITE_SENTRY_DSN` | DSN do projeto React no Sentry (opcional) |
| `SENTRY_ORG` | Slug da org no Sentry (opcional) |
| `SENTRY_PROJECT` | Nome do projeto no Sentry (opcional) |
| `SENTRY_AUTH_TOKEN` | Token de auth do Sentry para source maps (opcional) |

---

## 5. Configurar as variáveis de ambiente na Vercel

Embora o build aconteça no GitHub Actions, configure as variáveis também na Vercel para o caso de builds manuais futuros:

1. No projeto da Vercel → **Settings → Environment Variables**
2. Adicione para o ambiente **Production**:

| Variável | Valor |
|----------|-------|
| `VITE_API_URL` | URL da API em produção |
| `VITE_SENTRY_DSN` | DSN do Sentry (opcional) |

---

## 6. Fazer o primeiro deploy

O deploy é acionado criando e enviando uma **tag de versão**:

```bash
# 1. Certifique-se de que a main está atualizada
git checkout main
git pull origin main

# 2. Atualize o CHANGELOG.md com o que mudou na versão

# 3. Atualize a versão no package.json (opcional mas recomendado)
npm version 1.0.0 --no-git-tag-version

# 4. Commit das atualizações
git add CHANGELOG.md package.json
git commit -m "chore: release v1.0.0"

# 5. Crie e envie a tag
git tag v1.0.0
git push origin main
git push origin v1.0.0
```

O GitHub Actions irá:
1. Extrair as notas de versão do `CHANGELOG.md`
2. Criar um **GitHub Release** com as notas
3. Fazer o build com as variáveis de produção
4. Fazer o deploy na Vercel via `vercel deploy --prebuilt --prod`

---

## 7. Acompanhar o deploy

- **GitHub Actions**: repositório → aba **Actions** → workflow `Deploy`
- **Vercel**: painel do projeto → aba **Deployments**

---

## 8. Escrever o CHANGELOG

O `CHANGELOG.md` segue o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

Adicione sempre uma seção `[Unreleased]` no topo e preencha durante o desenvolvimento:

```markdown
## [Unreleased]

### Adicionado
- Nova funcionalidade X

### Corrigido
- Bug Y

## [1.0.1] - 2026-05-20
### Corrigido
- Problema com a tela de login em Safari
```

Ao criar a tag `v1.0.1`, o workflow extrai automaticamente o bloco `## [1.0.1]` e usa como corpo do GitHub Release.

---

## Troubleshooting

**Build falha com erro de variável de ambiente**
Verifique se `VITE_API_URL` está configurado nos secrets do GitHub. Variáveis `VITE_*` precisam estar disponíveis em tempo de build.

**`vercel deploy` retorna erro de autenticação**
Confirme que `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` estão corretos nos secrets. Rode `vercel whoami` localmente com o token para verificar.

**GitHub Release criado mas sem conteúdo**
Certifique-se que a seção no `CHANGELOG.md` usa exatamente o formato `## [1.0.0]` (com colchetes) e que a versão na tag corresponde (`v1.0.0` → extrai `1.0.0`).

**Deploy automático da Vercel ainda acontece**
Confirme que o campo **"Ignored Build Step"** está configurado com `exit 1` em Settings → Git na Vercel.

**Sentry source maps não aparecem**
O upload de source maps acontece durante o `npm run build`. Verifique se `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` e `SENTRY_PROJECT` estão nos secrets do GitHub.
