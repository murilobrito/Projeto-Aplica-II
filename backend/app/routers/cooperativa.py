import datetime as dt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.deps import coop_do_escopo, exige_papel, usuario_atual
from app.models import Coleta, Cooperativa, Correcao, Dispositivo, Usuario
from app.routers.usuarios import criar_usuario_interno, para_front as usuario_front
from app.schemas import CoopPatch, NovaCoopIn, NovoUsuarioIn

router = APIRouter(tags=["cooperativa"])


def para_front(c: Cooperativa) -> dict:
    return {"id": c.id, "razao": c.razao, "cnpj": c.cnpj, "endereco": c.endereco, "ativa": c.ativa}


def _coop_ou_404(session: Session, coop_id: int | None) -> Cooperativa:
    coop = session.get(Cooperativa, coop_id) if coop_id is not None else None
    if coop is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cooperativa não encontrada")
    return coop


def _aplicar(coop: Cooperativa, dados: CoopPatch, admin: bool) -> None:
    if dados.razao is not None:
        coop.razao = dados.razao.strip()
    if dados.cnpj is not None:
        coop.cnpj = dados.cnpj.strip()
    if dados.endereco is not None:
        coop.endereco = dados.endereco.strip()
    if admin and dados.ativa is not None:  # só a equipe EcoTriall ativa/desativa uma cooperativa
        coop.ativa = dados.ativa


# ---------- A cooperativa de quem está logado (gerente edita; admin informa qual) ----------
@router.get("/cooperativa")
def obter(
    cooperativa_id: int | None = None,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(usuario_atual),
):
    return para_front(_coop_ou_404(session, coop_do_escopo(atual, cooperativa_id)))


@router.patch("/cooperativa")
def atualizar(
    dados: CoopPatch,
    cooperativa_id: int | None = None,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(exige_papel("admin", "gerente")),
):
    coop = _coop_ou_404(session, coop_do_escopo(atual, cooperativa_id))
    _aplicar(coop, dados, admin=atual.role == "admin")
    session.add(coop)
    session.commit()
    session.refresh(coop)
    return para_front(coop)


# ---------- Plataforma (só admin = equipe EcoTriall) ----------
def _contagens(session: Session) -> dict[int, dict]:
    """Números por cooperativa, calculados de uma vez (evita uma consulta por cooperativa)."""
    inicio_hoje = dt.datetime.now(dt.timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    inicio_30d = inicio_hoje - dt.timedelta(days=29)
    nums: dict[int, dict] = {
        c.id: {"usuarios": 0, "catadores": 0, "dispositivos": 0, "dispositivosAtivos": 0,
               "itensHoje": 0, "itens30d": 0, "correcoes30d": 0}
        for c in session.exec(select(Cooperativa)).all()
    }
    for coop_id, role, qtd in session.exec(
        select(Usuario.cooperativa_id, Usuario.role, func.count()).where(Usuario.active).group_by(Usuario.cooperativa_id, Usuario.role)
    ).all():
        if coop_id in nums:
            nums[coop_id]["usuarios"] += qtd
            if role == "catador":
                nums[coop_id]["catadores"] += qtd
    for coop_id, ativo, qtd in session.exec(
        select(Dispositivo.cooperativa_id, Dispositivo.active, func.count()).group_by(Dispositivo.cooperativa_id, Dispositivo.active)
    ).all():
        if coop_id in nums:
            nums[coop_id]["dispositivos"] += qtd
            if ativo:
                nums[coop_id]["dispositivosAtivos"] += qtd
    for coop_id, criado in session.exec(
        select(Coleta.cooperativa_id, Coleta.created_at).where(Coleta.cooperativa_id.is_not(None))
    ).all():
        if coop_id not in nums:
            continue
        if criado.tzinfo is None:
            criado = criado.replace(tzinfo=dt.timezone.utc)
        if criado >= inicio_30d:
            nums[coop_id]["itens30d"] += 1
        if criado >= inicio_hoje:
            nums[coop_id]["itensHoje"] += 1
    for coop_id, criado in session.exec(
        select(Correcao.cooperativa_id, Correcao.created_at).where(Correcao.cooperativa_id.is_not(None))
    ).all():
        if coop_id not in nums:
            continue
        if criado.tzinfo is None:
            criado = criado.replace(tzinfo=dt.timezone.utc)
        if criado >= inicio_30d:
            nums[coop_id]["correcoes30d"] += 1
    return nums


@router.get("/cooperativas")
def listar_cooperativas(
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin")),
):
    nums = _contagens(session)
    return [
        {**para_front(c), **nums[c.id]}
        for c in session.exec(select(Cooperativa).order_by(Cooperativa.id)).all()
    ]


@router.post("/cooperativas", status_code=status.HTTP_201_CREATED)
def criar_cooperativa(
    dados: NovaCoopIn,
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin")),
):
    """Cria a cooperativa já com o primeiro gerente (sem ele, ninguém consegue administrá-la)."""
    razao, cnpj, endereco = dados.razao.strip(), dados.cnpj.strip(), dados.endereco.strip()
    if not razao or not cnpj or not endereco:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Preencha razão social, CNPJ e endereço")
    if not dados.gerente.name.strip() or not dados.gerente.phone.strip():
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Preencha nome e telefone do gerente")
    if any(c.cnpj == cnpj for c in session.exec(select(Cooperativa)).all()):
        raise HTTPException(status.HTTP_409_CONFLICT, "Já existe uma cooperativa com este CNPJ")

    coop = Cooperativa(razao=razao, cnpj=cnpj, endereco=endereco, ativa=True)
    session.add(coop)
    session.flush()
    gerente = criar_usuario_interno(
        session,
        NovoUsuarioIn(
            name=dados.gerente.name, role="gerente", email=dados.gerente.email, phone=dados.gerente.phone
        ),
        coop.id,
    )
    session.commit()
    session.refresh(coop)
    session.refresh(gerente)
    # Ainda não há "esqueci a senha": a senha inicial é a padrão de demonstração.
    return {**para_front(coop), "gerente": usuario_front(gerente), "senhaInicial": settings.seed_password}


@router.get("/cooperativas/{coop_id}")
def detalhe_cooperativa(
    coop_id: int,
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin")),
):
    coop = _coop_ou_404(session, coop_id)
    gerentes = session.exec(
        select(Usuario).where(Usuario.cooperativa_id == coop_id, Usuario.role == "gerente")
    ).all()
    return {**para_front(coop), **_contagens(session)[coop_id], "gerentes": [usuario_front(g) for g in gerentes]}


@router.patch("/cooperativas/{coop_id}")
def atualizar_cooperativa(
    coop_id: int,
    dados: CoopPatch,
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin")),
):
    coop = _coop_ou_404(session, coop_id)
    _aplicar(coop, dados, admin=True)
    session.add(coop)
    session.commit()
    session.refresh(coop)
    return para_front(coop)


@router.get("/plataforma/resumo")
def resumo_plataforma(
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin")),
):
    nums = _contagens(session)
    cooperativas = session.exec(select(Cooperativa).order_by(Cooperativa.id)).all()
    soma = lambda chave: sum(n[chave] for n in nums.values())  # noqa: E731
    return {
        "cooperativas": len(cooperativas),
        "cooperativasAtivas": sum(1 for c in cooperativas if c.ativa),
        "usuarios": soma("usuarios"),
        "dispositivos": soma("dispositivos"),
        "dispositivosAtivos": soma("dispositivosAtivos"),
        "itensHoje": soma("itensHoje"),
        "itens30d": soma("itens30d"),
        "correcoes30d": soma("correcoes30d"),
        "porCooperativa": [{**para_front(c), **nums[c.id]} for c in cooperativas],
    }
