# Templates n8n - CT Guedes

Este diretório contém templates de workflows n8n prontos para importação.

## 📥 Como Importar

1. Acesse seu n8n
2. Clique em **"Add workflow"** ou **"Import from file"**
3. Cole o conteúdo JSON ou faça upload do arquivo
4. Ajuste as credenciais (ver abaixo)
5. Ative o workflow

## 🔧 Configuração Necessária

### Credenciais a Configurar

| Workflow | Credencial Necessária | Tipo |
|----------|----------------------|------|
| Todos | Supabase API | HTTP Header Auth |

### Configurar Credencial Supabase

1. No n8n, vá em **Settings → Credentials**
2. Crie uma credencial do tipo **"Header Auth"**
3. Configure:
   - **Name**: `Supabase API`
   - **Header Name**: `apikey`
   - **Header Value**: Sua `SUPABASE_ANON_KEY`

### Variáveis a Ajustar

Em cada workflow, ajuste os seguintes valores nos nodes:

```
SUPABASE_URL = https://seu-projeto.supabase.co
WEBHOOK_RESPOSTA_URL = URL do seu sistema (opcional)
```

## 📋 Workflows Disponíveis

### WF-01: Criação Automática de Obra
- **Arquivo**: `WF-01-criacao-obra.json`
- **Gatilho**: Webhook (proposta aprovada)
- **Função**: Cria obra automaticamente com checklist inicial

### WF-03: Programação de Obras
- **Arquivo**: `WF-03-programacao-obras.json`
- **Gatilho**: Webhook (nova programação)
- **Função**: Registra programação e envia notificações

### WF-05: Geração de Medição
- **Arquivo**: `WF-05-geracao-medicao.json`
- **Gatilho**: Webhook (programação executada)
- **Função**: Calcula e gera medição com valores e correções

### WF-13: Auditoria LGPD
- **Arquivo**: `WF-13-auditoria-lgpd.json`
- **Gatilho**: Webhook (ação sensível)
- **Função**: Registra log de auditoria para conformidade

## 🧪 Como Testar

### Teste Manual via cURL

```bash
# Testar WF-01 - Criação de Obra
curl -X POST https://seu-n8n.com/webhook/criar-obra \
  -H "Content-Type: application/json" \
  -d '{
    "proposta_id": "prop-123",
    "cliente": {
      "id": "cli-456",
      "nome": "Empresa Teste",
      "email": "contato@teste.com"
    },
    "escopo": "Pintura e acabamento",
    "metragem": 500,
    "valor_total": 75000,
    "endereco": "Rua Teste, 123",
    "data_inicio_prevista": "2025-01-15"
  }'
```

### Teste via Sistema

1. Configure a URL do webhook no sistema (Configurações → Integrações)
2. Aprove uma proposta
3. Verifique se a obra foi criada automaticamente

## 🔄 Ativando MCP

Para que o Lovable possa interagir com seus workflows:

1. No n8n, vá em **Settings → MCP access**
2. Ative **Enable MCP access**
3. No workflow, vá em **Settings** (do workflow)
4. Ative **Available in MCP**

## 📞 Suporte

Em caso de dúvidas sobre a integração, consulte:
- [Documentação n8n](https://docs.n8n.io/)
- [Documentação Supabase](https://supabase.com/docs)
