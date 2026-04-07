

# Plano: Proteger arquivo .env no controle de versão

## Problema
O arquivo `.env` não está listado no `.gitignore`, então ele é versionado no repositório Git. Mesmo contendo apenas chaves públicas (anon key), é uma prática de segurança padrão excluir arquivos `.env` do controle de versão.

## Esclarecimento importante
As chaves no `.env` e em `src/integrations/supabase/client.ts` são **chaves anon/publishable** — elas são intencionalmente expostas no frontend (o Vite as injeta no bundle JavaScript). A segurança do sistema **não depende do sigilo dessas chaves**, mas sim das **políticas RLS** no banco de dados. Chaves secretas (como `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) estão armazenadas exclusivamente nos **Supabase Secrets**, nunca no código-fonte.

Mesmo assim, versionar `.env` é uma má prática que deve ser corrigida.

## Alteração

### 1. Adicionar `.env` ao `.gitignore`

Adicionar as seguintes entradas ao final do `.gitignore`:

```
# Environment files
.env
.env.*
```

Isso impedirá que qualquer arquivo `.env` atual ou futuro seja rastreado pelo Git.

**Nota**: O arquivo `.env` continuará existindo localmente e no ambiente Lovable (onde é gerado automaticamente), mas não será mais commitado no repositório. As variáveis `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e `VITE_SUPABASE_PROJECT_ID` são injetadas automaticamente pelo Lovable — não há risco de perda.

## Arquivos a editar
- `.gitignore` — adicionar exclusão de `.env`

