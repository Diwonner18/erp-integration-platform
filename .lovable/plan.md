

# Auditoria Completa de Seguranca - CT Guedes

## Estado Atual do Sistema

O sistema CT Guedes opera 100% como **protopipo frontend** sem backend real. Nao existe conexao Supabase (`supabase/` vazio), sem Edge Functions, sem banco de dados, sem autenticacao real. Todo o estado e persistido em `localStorage`.

---

## Vulnerabilidades Encontradas

### CRITICA - Senhas em Texto Plano no localStorage

**Arquivo:** `src/contexts/AuthContext.tsx` linhas 218, 224, 244-245, 318-324

**Risco:** Todas as senhas (incluindo `admin123` hardcoded para Carla) sao armazenadas em texto plano no `localStorage`. Qualquer pessoa com acesso ao DevTools (F12) pode ler todas as senhas de todos os usuarios cadastrados. Um script XSS conseguiria exfiltrar tudo.

**Severidade:** CRITICA

---

### CRITICA - Autenticacao Simulada no Frontend

**Arquivo:** `src/contexts/AuthContext.tsx` linhas 241-268

**Risco:** Login e verificado comparando email+senha diretamente no `localStorage` do navegador. Um atacante pode:
- Editar o `localStorage` para se autenticar como qualquer usuario
- Modificar `ct-guedes-user` para mudar seu `type` para `admin`
- Criar usuarios arbitrarios diretamente no `localStorage`

**Severidade:** CRITICA

---

### CRITICA - Autorizacao Apenas no Frontend (Broken Access Control)

**Arquivo:** `src/components/Auth/ProtectedRoute.tsx`, `src/contexts/AuthContext.tsx` linha 347-356

**Risco:** Roles e permissoes sao verificados apenas no React. Sem backend, nao existe enforcement real. Um usuario pode manipular o `localStorage` para obter qualquer role, incluindo admin. A verificacao especial de `carla@ctguedes.com.br` (linha 349) e trivialmente burlavel.

**Severidade:** CRITICA

---

### ALTA - Escalacao de Privilegio via Dominio de Email

**Arquivo:** `src/contexts/AuthContext.tsx` linhas 57-79, 306-311

**Risco:** Qualquer pessoa que cadastre um email `@ctguedes.com.br` recebe role `admin` temporario (linha 310). Alem disso, prefixos como `admin@`, `diretor@` automaticamente concedem admin. Sem validacao de dominio real no backend, qualquer atacante pode registrar com email falso.

**Severidade:** ALTA

---

### ALTA - Senha Admin Hardcoded

**Arquivo:** `src/contexts/AuthContext.tsx` linha 218

**Risco:** `password: 'admin123'` esta exposto no codigo-fonte publico. Qualquer pessoa pode fazer login como admin Carla.

**Severidade:** ALTA

---

### MEDIA - IDs Previsiveis (Date.now)

**Arquivo:** `src/contexts/AuthContext.tsx` linha 315

**Risco:** IDs de usuario gerados com `Date.now().toString()` sao sequenciais e previsiveis, facilitando enumeracao e IDOR quando backend for implementado.

**Severidade:** MEDIA

---

### MEDIA - Formularios sem Validacao Zod

**Arquivos afetados:**
- `src/pages/Login.tsx` - validacao basica manual
- `src/pages/Cadastro.tsx` - validacao basica manual
- `src/pages/Configuracoes.tsx` - sem validacao
- `src/components/Comercial/NovaPropostaModal.tsx` - nao verificado
- `src/components/Comercial/EditPropostaModal.tsx` - nao verificado
- `src/components/Obras/EditEquipamentoModal.tsx` - nao verificado
- `src/components/Obras/EditMaterialModal.tsx` - nao verificado
- `src/components/Financeiro/NovoBoletimModal.tsx` - nao verificado

**Formularios JA com Zod (5 modais):** GerenciarUsuarioModal, NovaMedicaoModal, AdicionarMaterialModal, SugestaoEscopoModal, SolicitarAgendamento.

**Risco:** Inputs sem validacao rigorosa podem causar dados corrompidos e, quando backend existir, potenciais injection attacks.

**Severidade:** MEDIA

---

### MEDIA - Console.log com Dados Operacionais

**Arquivos:** 12 arquivos com `console.log` expondo dados de operacoes (medicoes, pagamentos, observacoes, detalhes de retencao).

**Risco:** Dados de negocio visiveis no DevTools. Quando dados reais entrarem, informacoes sensiveis podem vazar.

**Severidade:** MEDIA

---

### BAIXA - dangerouslySetInnerHTML

**Arquivo:** `src/components/ui/chart.tsx` linha 79

**Risco:** Usado apenas para CSS themes gerado internamente (sem input do usuario). Seguro no contexto atual.

**Severidade:** BAIXA (informativo)

---

### BAIXA - Sem Chamadas Externas

Nenhum `fetch()` ou `axios` encontrado no codigo. O sistema nao faz requisicoes HTTP. Os templates n8n em `/docs/n8n-workflows/` sao apenas JSON para importacao manual.

**Severidade:** N/A (ponto positivo)

---

## Pontos Seguros

- Nenhuma API key ou secret exposta no codigo
- Nenhuma chamada HTTP externa (sem risco de SSRF/data leak)
- `dangerouslySetInnerHTML` usado apenas com dados internos
- 5 modais ja usam Zod + react-hook-form corretamente
- Rotas protegidas com ProtectedRoute (valido como camada UI)
- Sem dependencias externas suspeitas

---

## Resumo por Categoria

| # | Categoria | Status |
|---|-----------|--------|
| 1 | Autenticacao | CRITICO - Simulada, sem backend |
| 2 | Autorizacao | CRITICO - Apenas frontend, burlavel |
| 3 | Backend/RLS | INEXISTENTE - Sem Supabase |
| 4 | Validacao de Input | PARCIAL - 5/10+ modais com Zod |
| 5 | Integracoes/Webhooks | N/A - Nenhuma chamada externa |
| 6 | LGPD/Dados Sensiveis | CRITICO - Senhas em texto plano |
| 7 | Logs/Observabilidade | MEDIA - Console.logs com dados |

---

## Plano de Remediacao (Ordem de Prioridade)

### Fase 1: Eliminar Vulnerabilidades Criticas

1. **Habilitar Lovable Cloud / Supabase** - Criar banco real
2. **Migrar autenticacao para Supabase Auth** - Elimina senhas em localStorage, admin hardcoded, hash automatico
3. **Criar tabela `user_roles`** separada (nunca na tabela profiles) com enum `app_role` e funcao `has_role()` SECURITY DEFINER
4. **Implementar RLS** em todas as tabelas com politicas baseadas em `has_role()`

### Fase 2: Fortalecer Validacao

5. **Adicionar Zod** nos modais restantes (Login, Cadastro, Configuracoes, NovaPropostaModal, EditPropostaModal, EditEquipamentoModal, EditMaterialModal, NovoBoletimModal)
6. **Remover todos os `console.log`** com dados operacionais

### Fase 3: Preparar para Producao

7. **Criar Edge Functions** para webhooks n8n com CORS restrito e validacao de payload
8. **Gerar IDs com UUID** (via Supabase `gen_random_uuid()`)
9. **Implementar audit_logs** para LGPD
10. **Configurar headers de seguranca** (CSP, X-Frame-Options)

---

## Detalhes Tecnicos

### Estrutura da tabela user_roles

```text
user_roles
├── id: UUID (PK)
├── user_id: UUID (FK -> auth.users, ON DELETE CASCADE, NOT NULL)
└── role: app_role ENUM ('admin','obras','financeira','comercial','cliente')
    UNIQUE(user_id, role)
    RLS ENABLED
```

### Funcao has_role (SECURITY DEFINER)

Evita recursao infinita nas policies RLS. Consulta `user_roles` sem passar por RLS da propria tabela.

### AuthContext migrado

- Substituir localStorage por `supabase.auth.signInWithPassword()`
- Sessao gerenciada via JWT do Supabase
- Role carregado via query a `user_roles` (ou via claims customizados)
- Remover completamente `initializeDefaultAdmin()`
- Remover `password` de qualquer objeto JS

### Modais com Zod

Padrao a seguir (ja implementado em 5 modais):
- Schema Zod com `.min()`, `.max()`, `.email()`, `.positive()`
- `react-hook-form` com `zodResolver`
- Mensagens de erro em portugues
- Sanitizacao de strings com `.trim()`

