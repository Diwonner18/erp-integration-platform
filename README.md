# ERP de Gestão de Obras

Sistema web full-stack desenvolvido para centralizar processos **operacionais, comerciais, administrativos e financeiros** de empresas que trabalham com gestão e execução de obras.

O projeto foi estruturado como um ERP modular, reunindo gestão de obras, colaboradores, propostas, medições, EPIs, horas extras, financeiro, relatórios e portal do cliente em uma única aplicação.

> **Status:** Projeto concluído e preservado como demonstração de arquitetura e desenvolvimento.

---

## 🚀 Funcionalidades

### Gestão de Obras

* Cadastro e programação de obras
* Acompanhamento de obras em andamento
* Histórico de obras concluídas
* Gestão de equipes e responsáveis
* Controle de escopo
* Medições
* Alterações de escopo
* RDO
* Materiais e equipamentos

### Comercial

* Gestão de clientes
* Propostas comerciais
* Contratos
* Controle de status
* Alterações e aditivos
* Aceites digitais
* Relatórios comerciais

### Colaboradores

* Cadastro de colaboradores
* Histórico de alocação
* Controle de EPIs
* Banco de horas
* Horas extras
* Benefícios
* Faltas e afastamentos

### EPIs

* Cadastro de equipamentos
* Controle de estoque
* Entradas e saídas
* Entrega para colaboradores
* Controle de CA e validade
* Histórico de movimentações

### Financeiro

* Controle de despesas
* Pagamentos
* Retenções
* Medições
* Custos operacionais
* Fechamentos
* Relatórios financeiros

### Portal do Cliente

Área autenticada para acesso controlado a:

* Obras
* Propostas
* Relatórios
* Pagamentos
* Solicitações

Cada usuário possui acesso somente às informações autorizadas para seu perfil.

---

## 🔐 Autenticação e Segurança

A aplicação utiliza autenticação e autorização em múltiplas camadas.

Entre os recursos implementados estão:

* Autenticação de usuários
* JWT
* Controle baseado em perfis
* Permissões
* Rotas protegidas
* Row Level Security (RLS)
* Validação de dados
* Isolamento de informações
* Políticas de acesso no banco de dados

As regras de autorização não dependem exclusivamente da interface da aplicação.

---

## 🛠️ Tecnologias

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Hook Form
* Zod
* TanStack Query
* Recharts

### Backend

* Supabase
* PostgreSQL
* Supabase Auth
* Row Level Security
* Edge Functions
* Realtime

### Automação

* n8n
* Webhooks
* APIs REST

### Infraestrutura

* Git
* GitHub
* Node.js
* npm
* Linux
* Nginx
* HTTPS/SSL

---

## 🏗️ Arquitetura

```text
┌──────────────────────────────┐
│          Frontend            │
│   React + TypeScript + Vite  │
└──────────────┬───────────────┘
               │
               │ API / Auth
               ▼
┌──────────────────────────────┐
│           Backend            │
│                              │
│ PostgreSQL                   │
│ Authentication               │
│ Row Level Security           │
│ Realtime                     │
│ Edge Functions               │
└──────────────┬───────────────┘
               │
               │ APIs / Webhooks
               ▼
┌──────────────────────────────┐
│         Automações           │
│             n8n              │
└──────────────────────────────┘
```

---

## 💻 Executando localmente

### Pré-requisitos

* Node.js
* npm
* Git

Clone o projeto:

```bash
git clone <REPOSITORY_URL>
```

Acesse o diretório:

```bash
cd <PROJECT_DIRECTORY>
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Execute o ambiente de desenvolvimento:

```bash
npm run dev
```

---

## 📦 Build

Para gerar o build de produção:

```bash
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

---

## 🔑 Variáveis de ambiente

O projeto utiliza variáveis de ambiente para configuração de serviços externos.

Exemplo:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Nenhuma credencial de produção deve ser armazenada diretamente no repositório.

---

## 🔒 Segurança

Este repositório é uma versão pública do projeto e **não contém intencionalmente dados ou credenciais de produção**.

Nunca devem ser adicionados ao repositório:

* Arquivos `.env` com valores reais
* Senhas
* Tokens de acesso
* Service Role Keys
* Credenciais de banco de dados
* Chaves SSH
* Certificados privados
* Backups
* Dados pessoais
* Dados de clientes
* Dados de colaboradores

---

## 📁 Estrutura do projeto

```text
src/
├── components/
├── hooks/
├── integrations/
├── lib/
├── pages/
├── services/
└── utils/

public/
supabase/

package.json
vite.config.ts
tailwind.config.ts
tsconfig.json
```

---

## 📌 Sobre

Este repositório apresenta a implementação técnica de um **ERP web para gestão de obras**, desenvolvido com arquitetura moderna baseada em React, TypeScript, PostgreSQL e Supabase.

O projeto envolveu levantamento de requisitos, modelagem de dados, desenvolvimento frontend e backend, autenticação, controle de acesso, automações, testes, deploy e infraestrutura.

---

## 📄 Licença

Este repositório é disponibilizado para fins de **portfólio, demonstração técnica e estudo**.

A disponibilização pública do código-fonte não implica autorização automática para utilização de dados, marcas, documentos ou materiais pertencentes a terceiros.
