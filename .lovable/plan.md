

## Plano

### 1. Trocar Select por Input nos campos "Cliente"

**2 arquivos:**

- **`NovaPropostaModal.tsx`** (linha 69-81): Substituir o `<Select>` com opções mock por `<Input>` com `placeholder="Nome do cliente"`. O valor já é `formData.cliente`, basta trocar para `onChange={(e) => setFormData({...formData, cliente: e.target.value})}`.

- **`NovoBoletimModal.tsx`** (linha 75-87): Mesma troca — `<Select>` por `<Input>` com placeholder e onChange.

Isso remove os clientes mock (ABC Construções, Silva Engenharia, etc.) e permite o usuário digitar livremente.

### 2. Limpar notificações mock

**`NotificationPanel.tsx`** (linhas 28-75): Substituir `getNotificationsForUser()` por uma função que retorna array vazio `[]`. Manter toda a estrutura de renderização, mark as read, e empty state (que já existe na linha 148-152).

