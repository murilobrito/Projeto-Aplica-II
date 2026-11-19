from collections import Counter

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.deps import usuario_atual
from app.models import Coleta, Correcao, Usuario

router = APIRouter(tags=["dashboard"])

# Mix de referência quando ainda não há coletas suficientes (src/mocks/gestao.ts).
MIX_PADRAO = [
    {"material": "plastico", "percent": 42},
    {"material": "papel", "percent": 28},
    {"material": "metal", "percent": 15},
    {"material": "vidro", "percent": 10},
    {"material": "organico", "percent": 5},
]
# kg ainda são estimativa: não há sensor de peso no MVP (ver README).
TOTAL_KG = {"7": 570, "30": 2450, "90": 7100}
DAILY_KG = [round(45 + i * 2.4 + ((i * 37) % 11) * 3) for i in range(30)]


def _mix_das_coletas(coletas: list[Coleta]) -> list[dict]:
    if not coletas:
        return MIX_PADRAO
    contagem = Counter(c.material for c in coletas)
    total = sum(contagem.values())
    return [
        {"material": material, "percent": round(qtd * 100 / total)}
        for material, qtd in contagem.most_common()
    ]


@router.get("/dashboard")
def dashboard(
    session: Session = Depends(get_session),
    _: Usuario = Depends(usuario_atual),
):
    coletas = session.exec(select(Coleta)).all()
    correcoes = session.exec(select(Correcao)).all()

    itens = len(coletas)
    n_correcoes = len(correcoes)
    taxa = (n_correcoes / itens * 100) if itens else 0.0

    kpis = [
        {"id": "volume", "label": "VOLUME TOTAL COLETADO", "value": f"{TOTAL_KG['30']} kg", "delta": "+12.4%"},
        {"id": "valor", "label": "VALOR ESTIMADO DO LOTE", "value": "R$ 3.280,00", "delta": "+8.3%", "highlight": True},
        {"id": "itens", "label": "ITENS CLASSIFICADOS", "value": str(itens), "delta": "+15.1%"},
        {"id": "correcao", "label": "TAXA DE CORREÇÃO", "value": f"{taxa:.1f}%".replace(".", ","), "delta": "-1.2%"},
    ]

    return {
        "kpis": kpis,
        "mix": _mix_das_coletas(coletas),
        "dailyKg": DAILY_KG,
        "totalKg": TOTAL_KG,
        "itemsToday": itens,
    }
