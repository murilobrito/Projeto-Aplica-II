from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps import coop_do_escopo, exige_papel, usuario_atual
from app.models import Cooperativa, Dispositivo, Usuario
from app.schemas import VinculoIn

router = APIRouter(prefix="/dispositivos", tags=["dispositivos"])


def para_front(d: Dispositivo, nomes_coop: dict[int, str] | None = None) -> dict:
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
        "cooperativaId": d.cooperativa_id,
        "cooperativa": (nomes_coop or {}).get(d.cooperativa_id),
    }


def _listar(session: Session, coop: int | None) -> list[dict]:
    consulta = select(Dispositivo).order_by(Dispositivo.id)
    if coop is not None:
        consulta = consulta.where(Dispositivo.cooperativa_id == coop)
    nomes = {c.id: c.razao for c in session.exec(select(Cooperativa)).all()}
    return [para_front(d, nomes) for d in session.exec(consulta).all()]


@router.get("")
def listar_dispositivos(
    cooperativa_id: int | None = None,  # só vale para o admin
    session: Session = Depends(get_session),
    atual: Usuario = Depends(usuario_atual),
):
    return _listar(session, coop_do_escopo(atual, cooperativa_id))


@router.patch("/{device_id}/vinculo")
def vincular(
    device_id: int,
    dados: VinculoIn,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(exige_papel("admin", "gerente", "coordenador")),
):
    """Define quem opera a lixeira. Um catador opera uma por vez: ao vincular,
    ele sai da anterior. Devolve a lista da cooperativa, já atualizada."""
    dispositivo = session.get(Dispositivo, device_id)
    coop_usuario = coop_do_escopo(atual)
    # lixeira de outra cooperativa "não existe" para quem não é admin
    if dispositivo is None or (coop_usuario is not None and dispositivo.cooperativa_id != coop_usuario):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Dispositivo não encontrado")

    catador_id = dados.catador_id
    if catador_id:
        catador = session.get(Usuario, catador_id)
        if (
            catador is None
            or catador.role != "catador"
            or catador.cooperativa_id != dispositivo.cooperativa_id
        ):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Catador inválido")
        # tira o catador de qualquer outro dispositivo
        for d in session.exec(select(Dispositivo).where(Dispositivo.catador_id == catador_id)).all():
            if d.id != device_id:
                d.catador_id = None
                session.add(d)

    dispositivo.catador_id = catador_id
    session.add(dispositivo)
    session.commit()

    return _listar(session, coop_usuario if coop_usuario is not None else dispositivo.cooperativa_id)
