# EcoTriagem — Backend

API do EcoTriagem: autenticação, registro de coletas/correções e as telas de gestão.
A classificação de materiais vem de um **serviço de inferência separado** (o modelo do
`ecotriall-api`); por padrão o backend usa um **mock**, então roda sem depender do modelo.

- **Stack:** FastAPI + SQLModel + JWT. Banco SQLite por padrão (troque para Postgres numa variável).
- **Contrato com a IA:** ver [`para-o-colega/CONTRATO_INFERENCIA.md`](para-o-colega/CONTRATO_INFERENCIA.md).

## Rodar (Windows / PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Abra a documentação interativa em **http://localhost:8000/docs**.

No primeiro boot o banco é criado e populado com os mesmos usuários do frontend
(senha `123456`). Ex.: `gerente@ecotriall.com` / `123456`, ou o catador `RV-1024` / `123456`.

## Endpoints principais

| Método | Rota | Protegido | Tela do app |
|---|---|---|---|
| POST | `/auth/login` | não | LoginPage |
| GET | `/auth/me` | sim | — |
| POST | `/classificar` | opcional | CapturaPage (foto → material) |
| POST | `/correcoes` | opcional | CorrecaoView |
| GET | `/correcoes` | sim | CorrecoesPage |
| GET | `/dashboard` | sim | DashboardPage |
| GET | `/dispositivos` | sim | DispositivosPage |
| GET | `/usuarios` | gestão | UsuariosPage |
| GET | `/catadores` | sim | EquipePage |

## Ligar no modelo real

Quando o colega enviar os pesos (ou subir o serviço dele), no `.env`:

```
INFERENCE_MODE=http
INFERENCE_URL=http://localhost:8001
```

Nada mais muda — o `/classificar` passa a usar o modelo de verdade.

## Ligar o frontend neste backend

No `Projeto-Aplica-II`, troque a função `login` de `src/auth/AuthContext.tsx` (hoje em mock)
por um `fetch('http://localhost:8000/auth/login', ...)` e guarde o `token` para enviar no
header `Authorization: Bearer <token>` das demais chamadas. O `fakeClassify()` de
`src/mocks/captura.ts` vira um `POST /classificar` com a foto.

## Observações

- **kg e valor no dashboard são estimativas:** o MVP não tem sensor de peso. Os itens
  classificados e a taxa de correção, sim, vêm do banco.
- O fluxo de correção guarda `detectado` + `corrigido` + foto: é o dataset rotulado para
  o colega re-treinar o modelo.
