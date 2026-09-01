---
description: "Melhora o visual do frontend React/Vite do DMS usando Tailwind CSS 3."
name: melhorar-visual-tailwind
argument-hint: "direção visual opcional, ex. painel claro e institucional"
agent: tailwind-ui
---

# Melhorar visual com Tailwind CSS 3

Melhore o visual da aplicação Document Management System com Tailwind CSS 3, considerando o estado atual do frontend em `frontend/src`.

Use como direção visual: `${input:direcaoVisual:interface clara, institucional, moderna e objetiva para gestão de documentos}`.

## Contexto atual

- A aplicação é React + Vite em JavaScript puro.
- A tela atual contém identificação de usuário, upload de PDF, listagem de documentos e botão de download.
- A comunicação com o backend deve continuar via `fetch` e prefixo `/api`, conforme `frontend/src/services/documentsApi.js`.
- O projeto ainda deve permanecer simples, evolutivo e sem overengineering.

## Tarefa

Implemente uma melhoria visual completa e focada no frontend:

1. Configure Tailwind CSS 3 no diretório `frontend`, se ainda não existir.
2. Crie ou ajuste o CSS de entrada com as diretivas `@tailwind base`, `@tailwind components` e `@tailwind utilities`.
3. Atualize `App.jsx` e componentes em `frontend/src/components` para usar classes Tailwind.
4. Crie uma experiência responsiva com boa hierarquia visual, espaçamento consistente, contraste adequado e estados claros de erro, carregamento, vazio e envio.
5. Preserve todos os comportamentos existentes: owner, upload, refresh da lista, listagem e download.

## Restrições

- Não altere endpoints ou contratos do backend.
- Não substitua os componentes por uma landing page.
- Não adicione TypeScript.
- Não introduza dependências visuais além do necessário para Tailwind CSS 3.
- Não remova acessibilidade existente como `label`, `htmlFor`, `aria-labelledby` e `role="alert"`.

## Validação

Após implementar, execute dentro de `frontend`:

```bash
npm run build
```

Se o build falhar por configuração ou código alterado, corrija e rode novamente.