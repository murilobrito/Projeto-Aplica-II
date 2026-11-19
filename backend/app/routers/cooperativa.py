from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps import exige_papel, usuario_atual
from app.models import Cooperativa, Usuario
from app.schemas import CoopPatch

router = APIRouter(prefix="/cooperativa", tags=["cooperativa"])


def para_front(c: Cooperativa) -> dict:
    return {"razao": c.razao, "cnpj": c.cnpj, "endereco": c.endereco}


def _atual(session: Session) -> Cooperativa | None:
    return session.exec(select(Cooperativa).order_by(Cooperativa.id)).first()


@router.get("")
def obter(
    session: Session = Depends(get_session),
    _: Usuario = Depends(usuario_atual),
):
    coop = _atual(session)
    if coop is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cooperativa não configurada")
    return para_front(coop)


@router.patch("")
def atualizar(
    dados: CoopPatch,
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin", "gerente")),
):
    coop = _atual(session)
    if coop is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cooperativa não configurada")
    if dados.razao is not None:
        coop.razao = dados.razao.strip()
    if dados.cnpj is not None:
        coop.cnpj = dados.cnpj.strip()
    if dados.endereco is not None:
        coop.endereco = dados.endereco.strip()
    session.add(coop)
    session.commit()
    session.refresh(coop)
    return para_front(coop)
