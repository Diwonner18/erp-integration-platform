

## Plano: Remover alertas e notificações simuladas do Header

O problema: O `Header.tsx` possui alertas hardcoded que sempre aparecem para o admin (ex: "3 contratos com aniversário nos próximos 30 dias") e a bolinha vermelha no sino de notificação é acionada por esses mesmos alertas falsos. Como o sistema ainda não tem dados reais, esses avisos não deveriam aparecer.

### Alterações em `src/components/Layout/Header.tsx`

1. **Remover o bloco do `useEffect` que gera alertas fake** (linhas 18-49) — o array `alerts` inicia vazio e permanece vazio até que dados reais sejam conectados futuramente.

2. **Remover o bloco de renderização dos alertas** (linhas 130-142) — o `<div>` com os `<Alert>` dentro do `<header>`.

3. **Remover a bolinha vermelha condicional** (linhas 94-96) — ela depende de `alerts.length > 0`, que agora será sempre 0.

4. **Limpar imports não utilizados** — remover `useEffect`, `AlertTriangle`, `Calendar`, `Alert`, `AlertDescription` que ficam sem uso.

O sino de notificação continua funcionando normalmente (abre o `NotificationPanel`), mas sem indicador falso. Quando o sistema tiver dados reais, basta popular o array `alerts` com dados do backend.

### Arquivos afetados
- `src/components/Layout/Header.tsx` — único arquivo

