

# Implementação dos Itens Pendentes dos PDFs de Alinhamento

## Itens de Média Prioridade

### 1. Campo CNO na tabela `obras`
- Migration: `ALTER TABLE obras ADD COLUMN cno text;`
- Adicionar campo CNO nos formulários de criação/edição de obra
- Exibir CNO nos detalhes e cards de obra

### 2. Auto-preenchimento de endereço via CEP (ViaCEP)
- Criar hook `useCepLookup` que chama `https://viacep.com.br/ws/{cep}/json/`
- Integrar nos formulários que têm campo de endereço: Nova Programação, Solicitar Agendamento, Cadastro de Obra, Cadastro de Colaborador
- Ao digitar CEP com 8 dígitos, preencher automaticamente logradouro, bairro, cidade e UF

### 3. Tabela de tipos de EPI cadastráveis
- Migration: criar tabela `tipos_epi` (id, nome, ativo, created_at) com RLS
- Seed com tipos padrão (capacete, luva, óculos, bota, etc.)
- Substituir campo texto livre por Select/Combobox na página EPIs.tsx
- Adicionar tela de gerenciamento de tipos em Configurações ou Admin

### 4. Tabela de categorias/tipos de Horas Extras cadastráveis
- Migration: criar tabelas `categorias_hora_extra` e `tipos_hora_extra` com RLS
- Seed com valores atuais (A/B/C e Normal/Virada/Dobra/Diária/Continuação)
- Substituir valores hardcoded no frontend por queries às tabelas
- Adicionar tela de gerenciamento em Configurações ou Admin

## Itens de Baixa Prioridade

### 5. Contato do responsável na obra
- Migration: `ALTER TABLE obras ADD COLUMN responsavel_telefone text, ADD COLUMN responsavel_email text;`
- Campos na UI de edição de obra

### 6. Relatório quinzenal de HE
- Nova seção ou botão na página HorasExtras.tsx
- Filtro por quinzena (1-15 e 16-fim do mês)
- Agrupamento por colaborador com totais
- Exportação PDF/XLS

### 7. Integração RDO → Horas Extras
- Ao registrar presença no RDO com horário de saída após limite (17h seg-qui, 16h sex), gerar automaticamente registro de HE
- Requer que o RDO tenha campos de horário de entrada/saída por colaborador

### 8. Fluxo de convite/onboarding do cliente
- Admin/Comercial vincula `user_id` ao registro `clientes` ao criar o cliente
- Envio de email de convite com link de cadastro (Supabase Auth invite)
- Ao fazer login pela primeira vez, cliente vê apenas seus dados

## Detalhes Técnicos

**Migrations necessárias:**
- `ALTER TABLE obras ADD COLUMN cno text;`
- `ALTER TABLE obras ADD COLUMN responsavel_telefone text, ADD COLUMN responsavel_email text;`
- `CREATE TABLE tipos_epi (id uuid PK, nome text NOT NULL, ativo boolean DEFAULT true, created_at timestamptz DEFAULT now());` + RLS
- `CREATE TABLE categorias_hora_extra (...)` + `CREATE TABLE tipos_hora_extra (...)` + RLS
- Seed data para tipos de EPI e categorias/tipos de HE

**Arquivos a criar/modificar:**
- `src/hooks/useCepLookup.ts` (novo)
- `src/pages/Obras/EPIs.tsx` (Select em vez de Input para tipo)
- `src/pages/Obras/HorasExtras.tsx` (Select dinâmico + relatório quinzenal)
- Formulários de obra (campo CNO + contato responsável)
- Múltiplos formulários (integração CEP)

**Total: 4 migrations + ~10 arquivos modificados**

