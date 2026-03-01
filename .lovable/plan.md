

## Plano: Trocar Select por Input no campo "Responsável Técnico"

Dois arquivos possuem o campo "selecione o responsável" como lista de seleção:

### 1. `src/pages/Programacao.tsx` (linha 430-440)
- Substituir o `<select>` nativo com opções hardcoded (Eng. Carlos Silva, Eng. Ana Santos, Eng. João Pedro) por um `<Input>` com placeholder "Digite o Responsável Técnico".

### 2. `src/pages/Obras/EPIs.tsx` (linha 391-408)
- Substituir o `<Select>` (Radix) por um `<Input>` com placeholder "Digite o responsável pela entrega", mantendo o binding com `formData.responsavel` via `onChange`.

Nenhuma lógica ou layout será alterado — apenas o tipo do campo muda de seleção para digitação livre.

