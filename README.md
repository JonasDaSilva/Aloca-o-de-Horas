# Projeto de Alocação

Sistema de cadastro, login e alocação de colaboradores em projetos, com perfis de **colaborador** e **líder**. O frontend é uma aplicação React (Vite) e o backend uma API REST em Node.js com banco SQLite.

---

## Tecnologias

| Camada    | Stack |
|----------|--------|
| **Frontend** | React 19, Vite 7, Axios |
| **Backend**  | Node.js, Express 5, SQLite (sqlite + sqlite3), CORS |

---

## Estrutura do projeto

```
Jonas proj/
├── frontend/          # Aplicação React (Vite)
│   ├── public/        # Assets e páginas estáticas (colaborador, líder)
│   ├── formulario.jsx # Tela de cadastro
│   ├── login.jsx      # Tela de login
│   ├── App.jsx
│   └── ...
├── backend/           # API REST
│   ├── server.js      # Servidor Express e rotas
│   ├── api.js         # (se usado no frontend)
│   └── banco.db       # SQLite (criado ao subir o backend)
└── README.md
```

---

## Pré-requisitos

- **Node.js** (versão compatível com o projeto, ex.: 18+)
- **npm** (ou outro gerenciador de pacotes)

---

## Como rodar

### 1. Backend (API)

Na pasta do backend:

```bash
cd backend
npm install
npm start
```

O servidor sobe em **http://localhost:3000**. Na primeira execução o arquivo `banco.db` é criado e as tabelas são criadas/atualizadas automaticamente.

### 2. Frontend (React)

Em outro terminal, na pasta do frontend:

```bash
cd frontend
npm install
npm run dev
```

A aplicação fica em **http://localhost:5173**.

**Importante:** use sempre o frontend (porta 5173) para acessar login, cadastro e fluxo da aplicação. O backend (3000) é apenas a API.

---

## Funcionalidades

- **Login** com e-mail e senha; redirecionamento por perfil (colaborador ou líder).
- **Cadastro** com validação (nome, e-mail, confirmação de e-mail, idade, sexo, senha forte, perfil, aceite de termos).
- **Usuários:** listagem, busca por nome, criação, edição e exclusão.
- **Projetos:** CRUD de projetos (nome, código, data de início, criado por).
- **Alocação:** atribuir/remover colaboradores em projetos; listar projetos por colaborador e colaboradores por projeto.
- **Notificações:** criar e listar notificações por usuário.

---

## API (resumo)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Health check |
| POST | `/usuarios` | Cadastrar usuário |
| POST | `/login` | Login |
| GET | `/usuarios` | Listar usuários (query: `?nome=`) |
| GET | `/usuarios/:id` | Buscar usuário por ID |
| GET | `/usuarios/:id/notificacoes` | Notificações do usuário |
| PUT | `/usuarios/:id` | Atualizar usuário |
| DELETE | `/usuarios/:id` | Excluir usuário |
| GET | `/projetos` | Listar projetos |
| POST | `/projetos` | Criar projeto |
| PUT | `/projetos/:id` | Atualizar projeto |
| DELETE | `/projetos/:id` | Excluir projeto |
| POST | `/projetos/:projetoId/colaboradores/:colaboradorId` | Atribuir colaborador ao projeto |
| DELETE | `/projetos/:projetoId/colaboradores/:colaboradorId` | Remover colaborador do projeto |
| GET | `/projetos/:projetoId/colaboradores` | Colaboradores do projeto |
| GET | `/colaboradores/:colaboradorId/projetos` | Projetos do colaborador |
| POST | `/notificacoes` | Criar notificação |

O frontend usa **http://localhost:3000** como base URL da API (configurável em `frontend/api.js` ou onde o Axios/fetch é configurado).

---

## Scripts

**Backend (`backend/`)**

- `npm start` — inicia o servidor (porta 3000).

**Frontend (`frontend/`)**

- `npm run dev` — servidor de desenvolvimento (porta 5173).
- `npm run build` — build de produção.
- `npm run preview` — preview do build.
- `npm run lint` — ESLint.

---

## Banco de dados (SQLite)

Arquivo: `backend/banco.db`. Tabelas principais:

- **usuarios** — id, nome, email, senha, perfil, funcao, nome_empresa, cnpj, data_cadastro
- **projetos** — id, nome, codigo, data_inicio, data_criacao, criado_por
- **projeto_colaborador** — projeto_id, colaborador_id, data_atribuicao
- **notificacoes** — id, destinatario_id, titulo, mensagem, tipo, lida, data_criacao

O backend cria/atualiza as tabelas ao iniciar (`server.js`).

---

## Licença

ISC (conforme `backend/package.json`).
