

# Diagnóstico: Idioma e Fuso Horário não persistem

## Problema

Após investigar o código, identifiquei dois problemas:

1. **Persistência funciona apenas ao clicar "Salvar Preferências"**: As notificações salvam automaticamente ao trocar o switch, mas idioma/fuso horário exigem clique no botão. Isso pode confundir.

2. **Preferências são apenas cosméticas**: Mesmo salvando, o app não aplica de fato a mudança de idioma ou fuso horário — não há implementação de internacionalização (i18n) nem formatação de datas por timezone. Os selects apenas armazenam um valor.

## Plano de correção

### 1. Auto-save para idioma e fuso horário
Salvar automaticamente ao mudar o select (igual às notificações), eliminando a necessidade do botão "Salvar Preferências".

### 2. Feedback claro ao usuário
Mostrar toast confirmando que a preferência foi salva. Adicionar nota informando que a tradução do sistema será implementada futuramente (já que implementar i18n completo é um projeto grande).

### Arquivo modificado

| Arquivo | Mudança |
|---|---|
| `src/pages/Configuracoes.tsx` | Auto-save nos selects de idioma/fuso + feedback correto |

