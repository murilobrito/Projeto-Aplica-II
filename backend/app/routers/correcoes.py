import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps import coop_do_escopo, usuario_atual, usuario_opcional
from app.materiais import MATERIAIS, material_valido
from app.models import Coleta, Correcao, Dispositivo, Usuario
from app.schemas import CorrecaoIn

router = APIRouter(prefix="/correcoes", tags=["correcoes"])


@router.post("")
def registrar_correcao(
    dados: CorrecaoIn,
    session: Session = Depends(get_session),
    usuario: Usuario | None = Depends(usuario_opcional),
):
    """Catador corrigiu a IA. Guarda detectado + corrigido: isto é dado rotulado
    para o colega re-treinar o modelo (ciclo de melhoria contínua)."""
    if not material_valido(dados.detectado) or not material_valido(dados.corrigido):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Material inválido (use: plastico, papel, metal, vidro, organico, outros)",
        )

    coop = usuario.cooperativa_id if usuario else None
    device_id = dados.device_id
    if device_id is not None:
        lixeira = session.get(Dispositivo, device_id)
        if lixeira is None or lixeira.cooperativa_id != coop:
            device_id = None
    coleta_id = dados.coleta_id
    if coleta_id is not None:
        coleta = session.get(Coleta, coleta_id)
        if coleta is None or coleta.cooperativa_id != coop:
            coleta_id = None

    correcao = Correcao(
        cooperativa_id=coop,
        coleta_id=coleta_id,
        material_detectado=dados.detectado,
        material_corrigido=dados.corrigido,
        title=dados.title,
        confidence=dados.confidence,
        device_id=device_id,
        catador_id=usuario.login_id if usuario else None,
    )
    session.add(correcao)
    session.commit()
    session.refresh(correcao)
    return {"ok": True, "id": correcao.id}


def _quando(criado: dt.datetime, agora: dt.datetime) -> str:
    if criado.tzinfo is None:
        criado = criado.replace(tzinfo=dt.timezone.utc)
    minutos = int((agora - criado).total_seconds() // 60)
    if minutos < 1:
        return "Agora"
    if minutos < 60:
        return f"Há {minutos} min"
    horas = minutos // 60
    if horas < 24:
        return "Há 1 hora" if horas == 1 else f"Há {horas} horas"
    dias = (agora - criado).days
    if dias == 1:
        return "Ontem"
    return f"Há {dias} dias"


def _dias(criado: dt.datetime, agora: dt.datetime) -> int:
    if criado.tzinfo is None:
        criado = criado.replace(tzinfo=dt.timezone.utc)
    return (agora - criado).days


@router.get("")
def listar_correcoes(
    cooperativa_id: int | None = None,  # só vale para o admin
    session: Session = Depends(get_session),
    atual: Usuario = Depends(usuario_atual),
):
    """Formato igual ao type Correction do front (src/mocks/gestao.ts)."""
    coop = coop_do_escopo(atual, cooperativa_id)
    agora = dt.datetime.now(dt.timezone.utc)
    consulta = select(Correcao).order_by(Correcao.created_at.desc())
    if coop is not None:
        consulta = consulta.where(Correcao.cooperativa_id == coop)
    correcoes = session.exec(consulta).all()

    saida = []
    for c in correcoes:
        dispositivo = dispositivos.get(c.device_id)
        device_nome = dispositivo.name.replace("Inteligente ", "") if dispositivo else "—"
        autor = usuarios[c.catador_id].name if c.catador_id in usuarios else "—"
        conf = c.confidence or 0
        if 0 < conf <= 5:  # veio da captura (1–5 bolinhas) -> vira %
            conf *= 20
        saida.append({
            "id": c.id,
            "device": device_nome,
            "from": MATERIAIS.get(c.material_detectado, c.material_detectado),
            "to": MATERIAIS.get(c.material_corrigido, c.material_corrigido),
            "by": autor,
            "confidence": conf,
            "when": _quando(c.created_at, agora),
            "ageDays": _dias(c.created_at, agora),
        })
    return saida
