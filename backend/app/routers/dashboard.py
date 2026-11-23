import datetime as dt
from collections import Counter

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.deps import usuario_atual
from app.models import Categoria, Coleta, Correcao, Usuario

router = APIRouter(tags=["dashboard"])

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


def _brl(valor: float) -> str:
    return f"R$ {valor:,.2f}".replace(",", "~").replace(".", ",").replace("~", ".")


def _hoje(coletas: list[Coleta]) -> int:
    inicio = dt.datetime.now(dt.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return sum(1 for c in coletas if (c.created_at.replace(tzinfo=dt.timezone.utc) if c.created_at.tzinfo is None else c.created_at) >= inicio)


@router.get("/dashboard")
def dashboard(
    session: Session = Depends(get_session),
    _: Usuario = Depends(usuario_atual),
):
    coletas = session.exec(select(Coleta)).all()
    correcoes = session.exec(select(Correcao)).all()
    precos = {c.id: c.base_price for c in session.exec(select(Categoria)).all()}

    itens = len(coletas)
    taxa = (len(correcoes) / itens * 100) if itens else 0.0

    mix = _mix_das_coletas(coletas)
    valor_lote = sum(TOTAL_KG["30"] * m["percent"] / 100 * precos.get(m["material"], 0) for m in mix)

    kpis = [
        {"id": "volume", "label": "VOLUME TOTAL COLETADO", "value": f"{TOTAL_KG['30']} kg", "delta": "+12.4%"},
        {"id": "valor", "label": "VALOR ESTIMADO DO LOTE", "value": _brl(valor_lote), "delta": "+8.3%", "highlight": True},
        {"id": "itens", "label": "ITENS CLASSIFICADOS", "value": f"{itens:,}".replace(",", "."), "delta": "+15.1%"},
        {"id": "correcao", "label": "TAXA DE CORREÇÃO", "value": f"{taxa:.1f}%".replace(".", ","), "delta": "-1.2%"},
    ]

    return {
        "kpis": kpis,
        "mix": mix,
        "dailyKg": DAILY_KG,
        "totalKg": TOTAL_KG,
        "itemsToday": _hoje(coletas),
    }
