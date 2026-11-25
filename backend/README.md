# EcoTriagem — Backend

API do EcoTriagem: autenticação, registro de coletas/correções e as telas de gestão.
A classificação de materiais vem de um **serviço de inferência separado** (o modelo do
`ecotriall-api`); por padrão o backend usa um **mock**, então roda sem depender do modelo.

- **Stack:** FastAPI + SQLModel + JWT. Banco PostgreSQL no Supabase (ou SQLite local), definido na variável `DATABASE_URL`.
- **Contrato com a IA:** ver [`integracao-modelo/CONTRATO_INFERENCIA.md`](integracao-modelo/CONTRATO_INFERENCIA.md).

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

## Frontend

O frontend já consome esta API — as chamadas ficam em `src/lib/api.ts`, com login por JWT e o
token no header `Authorization`. A URL do backend vem de `VITE_API_URL` (padrão
`http://localhost:8000`); defina essa variável no `.env` do front se o backend rodar em outro
endereço.

## Observações

- **kg e valor no dashboard são estimativas:** o MVP não tem sensor de peso. Os itens
  classificados e a taxa de correção, sim, vêm do banco.
- O fluxo de correção guarda `detectado` + `corrigido` + foto: é o dataset rotulado para
  o colega re-treinar o modelo.
