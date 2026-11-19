from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps import exige_papel, usuario_atual
from app.models import Dispositivo, Usuario
from app.schemas import VinculoIn

router = APIRouter(prefix="/dispositivos", tags=["dispositivos"])


def para_front(d: Dispositivo) -> dict:
    # nomes de campo iguais ao type Device do front (src/mocks/gestao.ts)
    return {
        "id": d.id,
        "name": d.name,
        "location": d.location,
        "active": d.active,
        "catadorId": d.catador_id,
        "battery": d.battery,
        "signal": d.signal,
        "lastActivity": d.last_activity,
    }


@router.get("")
def listar_dispositivos(
    session: Session = Depends(get_session),
    _: Usuario = Depends(usuario_atual),
):
    dispositivos = session.exec(select(Dispositivo).order_by(Dispositivo.id)).all()
    return [para_front(d) for d in dispositivos]


@router.patch("/{device_id}/vinculo")
def vincular(
    device_id: int,
    dados: VinculoIn,
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin", "gerente", "coordenador")),
):
    """Define quem opera a lixeira. Um catador opera uma por vez: ao vincular,
    ele sai da anterior. Devolve a lista completa, já atualizada."""
    dispositivo = session.get(Dispositivo, device_id)
    if dispositivo is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dispositivo não encontrado")

    catador_id = dados.catador_id
    if catador_id:
        catador = session.get(Usuario, catador_id)
        if catador is None or catador.role != "catador":
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Catador inválido")
        # tira o catador de qualquer outro dispositivo
        for d in session.exec(select(Dispositivo).where(Dispositivo.catador_id == catador_id)).all():
            if d.id != device_id:
                d.catador_id = None
                session.add(d)

    dispositivo.catador_id = catador_id
    session.add(dispositivo)
    session.commit()

    dispositivos = session.exec(select(Dispositivo).order_by(Dispositivo.id)).all()
    return [para_front(d) for d in dispositivos]
