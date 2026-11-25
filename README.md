# EcoTriall

Lixeira inteligente de triagem de recicláveis para cooperativas de catadores. Um dispositivo
com câmera identifica o tipo do material descartado (e, no segundo semestre, estima a
qualidade/contaminação), enquanto uma plataforma web acompanha o volume, a composição e o
valor estimado do material coletado.

O diferencial frente às soluções comerciais, voltadas a grandes usinas, é cruzar **tipo** e
**qualidade** — o fator que define o preço de venda e, portanto, a renda da cooperativa.

Projeto das disciplinas de Projeto Aplicado I e II (PUC-Campinas).

## Como funciona

- **Estação de triagem** (`/captura`): roda no computador acoplado à câmera. O catador vê a
  classificação na hora, confirma ou corrige, e acompanha o turno — itens, mix e valor.
- **Painel do coordenador** (`/gestao`): dashboard, composição, relatórios, dispositivos,
  equipe, usuários e configuração de categorias e preços.
- O modelo de visão computacional roda como um serviço separado, consultado pelo back-end por
  HTTP. Enquanto ele não está no ar, o back-end usa um mock e nada fica parado.

## Tecnologias

- **Front-end:** React, TypeScript, Vite e Tailwind CSS.
- **Back-end:** FastAPI (Python), SQLModel e autenticação por JWT. Banco PostgreSQL (hospedado no Supabase), com SQLite como alternativa para rodar local.
- **Modelo:** YOLO (Ultralytics) / PyTorch, mantido no repositório `ecotriall-api`.

## Rodando o projeto

São duas partes — back-end e front-end. Deixe as duas rodando ao mesmo tempo.

Pré-requisitos: Python 3.11+ e Node.js 18+.

### Back-end (porta 8000)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

Antes de rodar, copie o `.env.example` para `.env`. O banco é definido pela variável
`DATABASE_URL`: sem mexer, ele usa um SQLite local; para o PostgreSQL, cole ali a string de
conexão do Supabase. No primeiro boot o banco é criado e populado com dados de demonstração.
A documentação da API fica em <http://localhost:8000/docs>.

### Front-end (porta 5173)

Em outro terminal, na raiz do repositório:

```powershell
npm install
npm run dev
```

Depois abra <http://localhost:5173>.

## Acessando o site

- **Painel do coordenador:** entre em <http://localhost:5173> com uma conta de teste (senha `123456`):
  - `gerente@ecotriall.com` — acesso total
  - `coordenador@ecotriall.com` — operação do dia a dia
- **Estação de triagem:** <http://localhost:5173/captura> (não exige login).

> A câmera só abre em `https://` ou em `localhost`. Para usar o celular como câmera, deixe-o
> como webcam do computador (apps como Iriun ou DroidCam, ou o recurso nativo do Windows) e
> escolha a câmera no seletor da própria tela de captura.

## Estrutura

- `src/` — front-end (React).
- `backend/` — API (FastAPI) e o contrato de integração com o modelo em `backend/integracao-modelo/`.
