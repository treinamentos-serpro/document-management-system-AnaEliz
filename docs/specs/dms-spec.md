# Especificação - Document Management System

## 1. Objetivo

Disponibilizar uma aplicação web para que usuários enviem, consultem e baixem
seus próprios documentos PDF, com arquivos armazenados localmente e metadados
mantidos em memória.

## 2. Escopo

### Dentro do escopo

- Upload de um documento PDF por vez.
- Listagem dos documentos enviados pelo usuário solicitante.
- Download de um documento pelo seu identificador.
- Identificação simples do proprietário por meio do header HTTP `X-User-Id`.
- Armazenamento dos arquivos no filesystem local da aplicação.

### Fora do escopo

- Autenticação, login, tokens ou gestão de contas de usuário.
- Armazenamento externo ou em nuvem.
- Persistência dos metadados em banco de dados ou arquivo.
- Compartilhamento de documentos entre usuários.
- Versionamento, edição, exclusão, busca ou paginação de documentos.
- Antivírus, assinatura digital, auditoria e notificações.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve aceitar o envio de um único arquivo no campo multipart `file`. |
| RF-02 | O sistema deve aceitar somente arquivos PDF com MIME type `application/pdf`. |
| RF-03 | O sistema deve rejeitar arquivos cujo tamanho exceda o limite configurado. O valor padrão é 10 MB. |
| RF-04 | O sistema deve exigir o header HTTP `X-User-Id` não vazio em todos os endpoints de documentos. |
| RF-05 | Após um upload válido, o sistema deve gravar o arquivo no filesystem local e retornar seus metadados públicos. |
| RF-06 | O sistema deve listar somente os metadados dos documentos pertencentes ao usuário identificado em `X-User-Id`. |
| RF-07 | O sistema deve permitir o download somente quando o documento pertencer ao usuário identificado em `X-User-Id`. |
| RF-08 | O sistema deve retornar `404 Not Found` quando o documento não existir ou não pertencer ao usuário solicitante. |
| RF-09 | O sistema deve retornar erros de validação em formato JSON consistente. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser gravados exclusivamente no filesystem local com `multer` e `diskStorage`. |
| RNF-02 | Os metadados devem permanecer somente em memória nesta fase e serão perdidos quando o processo for reiniciado. |
| RNF-03 | A configuração deve ser provida por variáveis de ambiente, conforme o princípio 12-Factor App. |
| RNF-04 | O nome usado no disco deve ser gerado pelo servidor e não pode reutilizar diretamente o nome original enviado. |
| RNF-05 | Caminhos de arquivos devem ser derivados apenas de metadados internos confiáveis, evitando path traversal. |
| RNF-06 | As respostas de erro devem usar `application/json`, código HTTP apropriado e os campos `error` e `message`. |
| RNF-07 | O backend deve manter a separação `routes -> controllers -> services -> repositories`. |
| RNF-08 | O frontend deve se comunicar com o backend por `fetch` utilizando o prefixo `/api` provido pelo proxy do Vite. |

### 4.1 Configuração por ambiente

| Variável | Obrigatória | Padrão | Descrição |
| --- | --- | --- | --- |
| `PORT` | Não | `3000` | Porta HTTP do backend. |
| `STORAGE_DIR` | Não | `backend/storage` | Diretório local destinado aos arquivos enviados. |
| `MAX_FILE_SIZE_BYTES` | Não | `10485760` | Tamanho máximo permitido para um upload, em bytes (10 MB). |

O diretório configurado em `STORAGE_DIR` deve existir ou ser criado durante a
inicialização da aplicação. O valor de `MAX_FILE_SIZE_BYTES` deve ser um inteiro
positivo; configurações inválidas devem impedir uma inicialização silenciosa.

## 5. Modelo de dados

### 5.1 Metadados internos do documento

Os metadados serão mantidos em memória em uma coleção indexada por `id`. O
repositório é responsável por armazenar e recuperar essa coleção, sem expor
detalhes do filesystem às camadas externas.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | UUID gerado pelo serviço para identificar unicamente o documento. |
| `originalName` | string | Sim | Nome do arquivo informado pelo cliente. |
| `storedName` | string | Sim | Nome gerado pelo servidor para o arquivo no disco. Campo interno, não exposto na API. |
| `mimeType` | string | Sim | MIME type validado do documento; nesta fase, `application/pdf`. Campo interno. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora do upload em ISO 8601 UTC. |
| `owner` | string | Sim | Identificador do proprietário obtido do header `X-User-Id`. |

### 5.2 Representação pública

As respostas de criação e listagem não devem expor `storedName`, diretórios
locais ou qualquer outro detalhe interno de armazenamento.

```json
{
  "id": "1d4d8f5a-4f97-47a4-b26d-3e7a98c4eb4c",
  "originalName": "relatorio-mensal.pdf",
  "size": 348120,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "ana.eliz"
}
```

## 6. Contratos de API

O backend expõe os caminhos abaixo sem o prefixo `/api`. No desenvolvimento, o
frontend usa `/api` porque o proxy do Vite remove esse prefixo antes de
encaminhar a requisição ao backend.

### Convenções gerais

- Todos os endpoints desta seção exigem `X-User-Id` com um valor não vazio.
- O valor do proprietário deve ser tratado como texto opaco nesta fase; não há
  autenticação associada ao header.
- Respostas JSON usam `Content-Type: application/json; charset=utf-8`.
- O corpo padrão de erro é:

```json
{
  "error": "INVALID_REQUEST",
  "message": "Descrição legível do problema."
}
```

### POST /upload

Cria um documento e armazena seu conteúdo localmente.

**Headers obrigatórios**

| Header | Valor |
| --- | --- |
| `X-User-Id` | Identificador não vazio do proprietário. |
| `Content-Type` | `multipart/form-data` com boundary definido pelo cliente HTTP. |

**Corpo da requisição**

| Campo | Tipo | Obrigatório | Regra |
| --- | --- | --- | --- |
| `file` | arquivo | Sim | PDF (`application/pdf`) com tamanho máximo de `MAX_FILE_SIZE_BYTES`. |

**Resposta de sucesso: `201 Created`**

```json
{
  "id": "1d4d8f5a-4f97-47a4-b26d-3e7a98c4eb4c",
  "originalName": "relatorio-mensal.pdf",
  "size": 348120,
  "uploadedAt": "2026-09-01T14:30:00.000Z",
  "owner": "ana.eliz"
}
```

**Erros**

| Status | `error` | Situação |
| --- | --- | --- |
| `400` | `MISSING_USER_ID` | Header `X-User-Id` ausente, vazio ou composto apenas de espaços. |
| `400` | `MISSING_FILE` | Campo `file` ausente. |
| `400` | `INVALID_FILE_TYPE` | Arquivo não é um PDF. |
| `413` | `FILE_TOO_LARGE` | Arquivo excede `MAX_FILE_SIZE_BYTES`. |
| `500` | `INTERNAL_ERROR` | Falha inesperada ao processar ou registrar o documento. |

### GET /documents

Retorna os metadados públicos dos documentos pertencentes ao solicitante.

**Headers obrigatórios**

| Header | Valor |
| --- | --- |
| `X-User-Id` | Identificador não vazio do proprietário. |

**Resposta de sucesso: `200 OK`**

A lista deve estar ordenada por `uploadedAt` em ordem decrescente. Não há
paginação nesta fase; uma lista vazia retorna `[]`.

```json
[
  {
    "id": "1d4d8f5a-4f97-47a4-b26d-3e7a98c4eb4c",
    "originalName": "relatorio-mensal.pdf",
    "size": 348120,
    "uploadedAt": "2026-09-01T14:30:00.000Z",
    "owner": "ana.eliz"
  }
]
```

**Erros**

| Status | `error` | Situação |
| --- | --- | --- |
| `400` | `MISSING_USER_ID` | Header `X-User-Id` ausente, vazio ou composto apenas de espaços. |
| `500` | `INTERNAL_ERROR` | Falha inesperada ao consultar os metadados. |

### GET /documents/:id/download

Envia o conteúdo binário de um documento pertencente ao solicitante.

**Parâmetros de rota**

| Parâmetro | Tipo | Regra |
| --- | --- | --- |
| `id` | string | UUID do documento. |

**Headers obrigatórios**

| Header | Valor |
| --- | --- |
| `X-User-Id` | Identificador não vazio do proprietário. |

**Resposta de sucesso: `200 OK`**

| Header | Valor |
| --- | --- |
| `Content-Type` | `application/pdf` |
| `Content-Length` | Tamanho original em bytes. |
| `Content-Disposition` | `attachment; filename="<originalName>"` com nome sanitizado para header. |

O corpo contém o binário do PDF. A transferência deve ser feita por streaming,
sem carregar o arquivo inteiro em memória.

**Erros**

| Status | `error` | Situação |
| --- | --- | --- |
| `400` | `MISSING_USER_ID` | Header `X-User-Id` ausente, vazio ou composto apenas de espaços. |
| `404` | `DOCUMENT_NOT_FOUND` | ID inexistente, documento de outro proprietário ou arquivo local indisponível. |
| `500` | `INTERNAL_ERROR` | Falha inesperada durante a leitura do arquivo. |

## 7. Decisões arquiteturais

### 7.1 Backend

O backend seguirá uma Clean Architecture simples com o fluxo de dependências
`routes -> controllers -> services -> repositories`.

| Camada | Responsabilidades |
| --- | --- |
| `routes/` | Registrar os endpoints Express, associar middleware de upload e delegar aos controllers. |
| `controllers/` | Extrair dados HTTP, validar a presença de `X-User-Id`, converter resultados em respostas HTTP e mapear erros conhecidos. |
| `services/` | Gerar UUID, aplicar regras de negócio, validar tipo/tamanho, controlar autorização por proprietário e coordenar repositórios. |
| `repositories/` | Gravar e localizar arquivos no diretório local, além de armazenar e consultar metadados em memória. |

As camadas `services/` e `repositories/` não devem depender de objetos de
requisição/resposta do Express. O controller é o limite para detalhes HTTP e o
repositório é o limite para detalhes do filesystem.

O `multer` deve usar `diskStorage` e ser configurado na borda HTTP. O serviço
continua responsável por decidir se o resultado do upload atende às regras do
domínio e por remover o arquivo temporariamente persistido caso uma regra de
negócio posterior falhe.

### 7.2 Frontend

O frontend React será organizado em `components/`, `pages/` e `services/`. A
camada de serviços centraliza chamadas `fetch` para `/api/upload`,
`/api/documents` e `/api/documents/:id/download`, sempre enviando `X-User-Id`.

Os componentes devem cobrir estados de carregamento, lista vazia, sucesso de
upload e mensagens de erro retornadas pela API. O download deve consumir o
binário como `Blob` e iniciar o salvamento no navegador com o nome informado
pela resposta HTTP.

## 8. Fluxos de usuário

### 8.1 Enviar documento

1. O usuário informa seu identificador simples e seleciona um arquivo PDF.
2. O frontend envia `POST /api/upload` com `X-User-Id` e `FormData` contendo
   `file`.
3. O backend valida o usuário e o arquivo, grava o binário localmente e mantém
   seus metadados em memória.
4. O frontend exibe o documento criado e atualiza a listagem do usuário.
5. Em caso de falha, o frontend mostra a mensagem recebida sem incluir detalhes
   internos do servidor.

### 8.2 Consultar documentos

1. O frontend envia `GET /api/documents` com `X-User-Id`.
2. O backend retorna somente os documentos daquele proprietário, do mais novo
   para o mais antigo.
3. O frontend apresenta lista vazia ou a relação de documentos com nome,
   tamanho, data de upload e ação de download.

### 8.3 Baixar documento

1. O usuário aciona o download de um item da sua lista.
2. O frontend solicita `GET /api/documents/:id/download` com `X-User-Id`.
3. O backend confirma a propriedade, localiza o arquivo pelo nome interno e o
   transmite como anexo PDF.
4. O navegador salva o binário com o nome original entregue em
   `Content-Disposition`.

## 9. Validações e tratamento de erro

| Regra | Comportamento |
| --- | --- |
| Usuário ausente | Rejeitar antes de executar operações de documento com `400 MISSING_USER_ID`. |
| Arquivo ausente | Rejeitar upload com `400 MISSING_FILE`. |
| Tipo inválido | Rejeitar arquivo cujo MIME type não seja `application/pdf` com `400 INVALID_FILE_TYPE`. |
| Tamanho excedido | Rejeitar com `413 FILE_TOO_LARGE`; não manter o binário no storage. |
| Documento não encontrado ou não autorizado | Retornar `404 DOCUMENT_NOT_FOUND`, sem indicar se o ID pertence a outro usuário. |
| Arquivo ausente no disco | Retornar `404 DOCUMENT_NOT_FOUND`; o caminho local nunca aparece na resposta. |
| Erro inesperado | Registrar o detalhe no servidor e retornar `500 INTERNAL_ERROR` com mensagem genérica ao cliente. |

O frontend deve apresentar a mensagem retornada pelo contrato e preservar o
estado necessário para que o usuário possa corrigir a entrada e tentar
novamente.

## 10. Plano de execução

Este plano define as próximas etapas de implementação. Esta especificação não
executa nem cria arquivos de backend ou frontend.

1. **Preparar configuração e estrutura do backend:** definir leitura e validação
   de `PORT`, `STORAGE_DIR` e `MAX_FILE_SIZE_BYTES`; garantir a existência do
   diretório local de armazenamento.
2. **Implementar os repositórios:** criar o repositório de metadados em memória
   e o acesso ao filesystem, com nomes internos gerados e resolução segura de
   caminhos.
3. **Implementar os serviços de documentos:** gerar UUIDs, validar regras de
   domínio, aplicar isolamento por proprietário, ordenar listagens e coordenar
   persistência/limpeza em caso de falhas.
4. **Implementar controllers, middleware e rotas:** configurar `multer`
   `diskStorage`, extrair `X-User-Id`, mapear erros e expor `POST /upload`,
   `GET /documents` e `GET /documents/:id/download` no Express.
5. **Cobrir o backend com testes:** usar `node:test` para validar upload,
   limites, tipo de arquivo, isolamento por proprietário, listagem ordenada,
   download e respostas de erro.
6. **Implementar a interface React:** criar página e componentes para informar
   usuário, enviar PDF, listar metadados e baixar documentos, com uma camada de
   serviços baseada em `fetch` e prefixo `/api`.
7. **Integrar e validar o fluxo completo:** testar manualmente e de forma
   automatizada os fluxos de upload, listagem e download; confirmar que somente
   `backend/storage` recebe binários e que os metadados são reiniciados ao
   reiniciar o backend.

## 11. Critérios de aceite

- Um usuário com `X-User-Id` válido consegue enviar um PDF de até 10 MB e
  recebe `201` com os metadados públicos.
- Arquivos não PDF, uploads sem arquivo e arquivos maiores que o limite são
  rejeitados pelos status e códigos de erro definidos.
- A listagem retorna apenas documentos do usuário solicitante, ordenados do
  mais recente para o mais antigo.
- Um usuário consegue baixar somente seus próprios documentos como anexo PDF.
- A tentativa de baixar um documento inexistente ou pertencente a outro usuário
  retorna `404 DOCUMENT_NOT_FOUND`.
- Binários ficam no diretório local configurado e metadados não sobrevivem ao
  reinício do processo.
- A implementação respeita a separação de responsabilidades definida na seção
  de decisões arquiteturais.