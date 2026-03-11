

## Plano: Arquitetura completa do sistema no Supabase

### Estado atual
- Zero tabelas no Supabase
- Auth via localStorage com senhas em texto puro
- Todas as paginas usam `useState<any[]>([])` -- sem dados reais
- 5 perfis de usuario, 16 permissoes mapeadas no frontend

### Schema completo do banco de dados

```text
┌─────────────────┐     ┌──────────────────┐     ┌───────────────────┐
│    profiles      │     │   user_roles      │     │    clientes       │
│ id (FK auth)     │────>│ user_id (FK auth) │     │ id                │
│ full_name        │     │ role (app_role)   │     │ razao_social      │
│ email            │     └──────────────────┘     │ cnpj / cpf        │
│ avatar_url       │                               │ contato_email     │
│ telefone         │     ┌──────────────────┐     │ contato_telefone  │
└─────────────────┘     │ propostas         │     │ user_id (FK auth) │
                         │ id                │     └───────────────────┘
┌─────────────────┐     │ cliente_id (FK)   │            │
│     obras        │<────│ obra_id (FK)      │            │
│ id               │     │ titulo            │     ┌──────┴────────────┐
│ nome             │     │ valor             │     │  aceites_digitais  │
│ cliente_id (FK)  │     │ status            │     │ id                 │
│ endereco         │     │ data_criacao      │     │ proposta_id (FK)   │
│ status           │     │ data_validade     │     │ cliente_id (FK)    │
│ data_inicio      │     │ created_by (FK)   │     │ aceito_em          │
│ data_previsao    │     └──────────────────┘     │ ip_address         │
│ data_conclusao   │                               └────────────────────┘
│ valor_contrato   │     ┌──────────────────┐
│ progresso        │     │   medicoes        │     ┌───────────────────┐
│ responsavel_id   │     │ id                │     │  boletins_medicao  │
│ created_by (FK)  │     │ obra_id (FK)      │     │ id                 │
└─────────────────┘     │ descricao         │     │ obra_id (FK)       │
        │                │ valor             │     │ medicao_id (FK)    │
        │                │ percentual        │     │ numero             │
        │                │ status            │     │ valor              │
        │                │ data_medicao      │     │ status             │
        │                │ created_by (FK)   │     │ data_emissao       │
        │                └──────────────────┘     │ created_by (FK)    │
        │                                          └───────────────────┘
        │
        │  ┌──────────────────┐    ┌───────────────────┐    ┌───────────────────┐
        ├─>│  programacoes     │    │  materiais         │    │  equipamentos     │
        │  │ id                │    │ id                 │    │ id                │
        │  │ obra_id (FK)      │    │ obra_id (FK)       │    │ obra_id (FK)      │
        │  │ data_programada   │    │ nome               │    │ nome              │
        │  │ equipe            │    │ quantidade         │    │ quantidade        │
        │  │ status            │    │ unidade            │    │ status            │
        │  │ observacoes       │    │ valor_unitario     │    │ valor_unitario    │
        │  │ created_by (FK)   │    │ created_by (FK)    │    │ created_by (FK)   │
        │  └──────────────────┘    └───────────────────┘    └───────────────────┘
        │
        │  ┌──────────────────┐    ┌───────────────────┐    ┌───────────────────┐
        ├─>│  alteracoes_escopo│    │  epis              │    │  horas_extras     │
        │  │ id                │    │ id                 │    │ id                │
        │  │ obra_id (FK)      │    │ obra_id (FK)       │    │ obra_id (FK)      │
        │  │ descricao         │    │ tipo               │    │ funcionario       │
        │  │ justificativa     │    │ quantidade         │    │ data              │
        │  │ impacto_valor     │    │ data_entrega       │    │ horas             │
        │  │ status            │    │ funcionario        │    │ valor_hora        │
        │  │ created_by (FK)   │    │ created_by (FK)    │    │ status            │
        │  └──────────────────┘    └───────────────────┘    │ created_by (FK)   │
        │                                                    └───────────────────┘
        │
        │  ┌──────────────────┐    ┌───────────────────┐    ┌───────────────────┐
        └─>│  despesas         │    │  retencoes         │    │ relatorios_diarios│
           │ id                │    │ id                 │    │ id                │
           │ obra_id (FK)      │    │ obra_id (FK)       │    │ obra_id (FK)      │
           │ descricao         │    │ tipo               │    │ data              │
           │ valor             │    │ percentual         │    │ clima             │
           │ categoria         │    │ valor              │    │ atividades        │
           │ data              │    │ status             │    │ ocorrencias       │
           │ created_by (FK)   │    │ created_by (FK)    │    │ created_by (FK)   │
           └──────────────────┘    └───────────────────┘    └───────────────────┘

┌─────────────────────┐    ┌───────────────────┐    ┌───────────────────┐
│  valores_unitarios   │    │  modelos_contrato  │    │  notificacoes     │
│ id                   │    │ id                 │    │ id                │
│ cliente_id (FK)      │    │ titulo             │    │ user_id (FK)      │
│ descricao            │    │ conteudo           │    │ titulo            │
│ unidade              │    │ tipo               │    │ mensagem          │
│ valor                │    │ created_by (FK)    │    │ lida              │
│ created_by (FK)      │    └───────────────────┘    │ tipo              │
└─────────────────────┘                               └───────────────────┘

┌─────────────────────┐    ┌───────────────────┐
│  logs_auditoria      │    │  aprovacoes       │
│ id                   │    │ id                │
│ user_id (FK)         │    │ tipo              │
│ acao                 │    │ referencia_id     │
│ tabela               │    │ solicitante_id    │
│ registro_id          │    │ aprovador_id      │
│ dados_anteriores     │    │ status            │
│ dados_novos          │    │ comentario        │
│ ip_address           │    │ created_at        │
│ created_at           │    └───────────────────┘
└─────────────────────┘
```

### Etapas de implementacao

**Etapa 1 -- Fundacao (auth + hierarquia)**
- Criar enum `app_role` (admin, obras, financeira, comercial, cliente)
- Criar tabelas `profiles` e `user_roles` com RLS
- Criar funcao `has_role()` SECURITY DEFINER
- Criar trigger `on_auth_user_created` para auto-criar profile
- Migrar `AuthContext.tsx` para `supabase.auth`
- Atualizar `Login.tsx` e `Cadastro.tsx`

**Etapa 2 -- Tabelas de dominio (dados do negocio)**
- Criar `clientes`, `obras`, `propostas`, `aceites_digitais`
- Criar `medicoes`, `boletins_medicao`, `programacoes`
- Criar `materiais`, `equipamentos`, `epis`, `alteracoes_escopo`
- Criar `horas_extras`, `despesas`, `retencoes`, `relatorios_diarios`
- Criar `valores_unitarios`, `modelos_contrato`
- RLS em todas: admin ve tudo, equipes veem por area, clientes veem apenas seus dados

**Etapa 3 -- Tabelas de suporte (sistema)**
- Criar `notificacoes`, `logs_auditoria`, `aprovacoes`
- Triggers para log automatico de alteracoes criticas

**Etapa 4 -- Migrar frontend para Supabase**
- Substituir `useState<any[]>([])` por queries `supabase.from().select()` com React Query
- Criar hooks customizados: `useObras`, `useMedicoes`, `usePropostas`, etc.
- Dashboard consome contagens reais do banco

**Etapa 5 -- Edge Functions (ponte para n8n)**
- Criar funcoes de saida: `on-proposta-aprovada`, `on-medicao-executada`, `on-programacao-criada`
- Criar funcoes de entrada: `webhook-criar-obra`, `webhook-notificacao`
- Conectar aos 14 workflows n8n

### Prioridade de execucao

Vou comecar pela **Etapa 1** (auth + hierarquia) porque tudo depende dela -- sem autenticacao real e roles, as RLS policies das outras tabelas nao funcionam.

### Detalhes tecnicos

- Todas as tabelas usam `uuid` como PK com `gen_random_uuid()`
- Foreign keys para `auth.users(id)` com `ON DELETE CASCADE`
- Colunas `created_at` e `updated_at` com defaults automaticos
- Enum `obra_status`: pendente, agendada, em_andamento, pausada, concluida, cancelada
- Enum `medicao_status`: pendente, aprovada, rejeitada
- Enum `proposta_status`: pendente, em_analise, aprovada, rejeitada
- RLS usa `has_role()` para evitar recursao infinita
- Clientes veem apenas registros onde `cliente_id` corresponde ao seu `user_id`

