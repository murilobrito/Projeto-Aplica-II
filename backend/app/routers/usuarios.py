from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.deps import coop_do_escopo, exige_papel, usuario_atual
from app.models import Cooperativa, Dispositivo, Usuario
from app.schemas import NovoUsuarioIn, UsuarioPatch
from app.security import hash_senha

router = APIRouter(tags=["usuarios"])

PAPEIS_VALIDOS = {"gerente", "coordenador", "catador"}


def para_front(u: Usuario) -> dict:
    # nomes de campo iguais ao type CoopUser do front (src/mocks/gestao.ts)
    return {
        "id": u.login_id,
        "name": u.name,
        "role": u.role,
        "email": u.email,
        "phone": u.phone,
        "active": u.active,
        "cooperativaId": u.cooperativa_id,
    }


# IDs automáticos: catadores 1xxx, gerente/coordenador 0xxx (igual ao front).
# O ID é único na plataforma inteira (é o login), por isso olha todas as cooperativas.
def proximo_login_id(session: Session, role: str) -> str:
    catador = role == "catador"
    numeros = []
    for u in session.exec(select(Usuario)).all():
        try:
            n = int(u.login_id.replace("RV-", ""))
        except ValueError:
            continue
        if (n >= 1000) == catador:
            numeros.append(n)
    proximo = (max(numeros) + 1) if numeros else (1000 if catador else 1)
    return f"RV-{proximo:04d}"


# Mesma regra de permissions.ts: gerente cria todos; coordenador só catador
def pode_criar(papel_requester: str, papel_alvo: str) -> bool:
    if papel_requester == "admin":
        return True
    if papel_alvo in ("gerente", "coordenador"):
        return papel_requester == "gerente"
    if papel_alvo == "catador":
        return papel_requester in ("gerente", "coordenador")
    return False


def criar_usuario_interno(session: Session, dados: NovoUsuarioIn, cooperativa_id: int) -> Usuario:
    """Cria o usuário (sem commit). Também usado ao criar uma cooperativa nova."""
    login_id = proximo_login_id(session, dados.role)
    novo = Usuario(
        login_id=login_id,
        name=dados.name.strip(),
        email=(dados.email or "").strip() or None,
        phone=dados.phone.strip() or None,
        role=dados.role,
        active=True,
        senha_hash=hash_senha(settings.seed_password),
        cooperativa_id=cooperativa_id,
    )
    session.add(novo)
    session.flush()
    return novo


def vincular_catador(session: Session, device_id: int, catador_id: str | None) -> None:
    """Define o operador do dispositivo; um catador opera uma lixeira por vez."""
    alvo = session.get(Dispositivo, device_id)
    coop = alvo.cooperativa_id if alvo else None
    for d in session.exec(select(Dispositivo).where(Dispositivo.cooperativa_id == coop)).all():
        if d.id == device_id:
            d.catador_id = catador_id
            session.add(d)
        elif catador_id and d.catador_id == catador_id:
            d.catador_id = None
            session.add(d)


@router.get("/usuarios")
def listar_usuarios(
    cooperativa_id: int | None = None,  # só vale para o admin
    session: Session = Depends(get_session),
    atual: Usuario = Depends(exige_papel("admin", "gerente", "coordenador")),
):
    coop = coop_do_escopo(atual, cooperativa_id)
    consulta = select(Usuario)
    if coop is not None:
        consulta = consulta.where(Usuario.cooperativa_id == coop)
    usuarios = session.exec(consulta).all()
    # Quem pode ver quem (a regra mora aqui no back; o front só esconde botões):
    # admin vê todos; gerente não vê o admin; coordenador só vê catadores.
    if atual.role == "gerente":
        usuarios = [u for u in usuarios if u.role != "admin"]
    elif atual.role == "coordenador":
        usuarios = [u for u in usuarios if u.role == "catador"]
    return [para_front(u) for u in usuarios]


@router.post("/usuarios", status_code=status.HTTP_201_CREATED)
def criar_usuario(
    dados: NovoUsuarioIn,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(usuario_atual),
):
    if dados.role not in PAPEIS_VALIDOS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Perfil inválido")
    if not pode_criar(atual.role, dados.role):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Seu perfil não pode criar esse tipo de usuário")

    # O novo usuário nasce na cooperativa de quem o cria; o admin escolhe qual.
    if atual.role == "admin":
        if dados.cooperativa_id is None or session.get(Cooperativa, dados.cooperativa_id) is None:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Informe a cooperativa")
        coop = dados.cooperativa_id
    else:
        coop = coop_do_escopo(atual)

    lixeira = None
    if dados.role == "catador" and dados.device_id:
        lixeira = session.get(Dispositivo, dados.device_id)
        if lixeira is None or lixeira.cooperativa_id != coop:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Dispositivo inválido")

    novo = criar_usuario_interno(session, dados, coop)
    if lixeira is not None:
        vincular_catador(session, lixeira.id, novo.login_id)

    session.commit()
    session.refresh(novo)
    return para_front(novo)


@router.patch("/usuarios/{login_id}")
def atualizar_usuario(
    login_id: str,
    dados: UsuarioPatch,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(exige_papel("admin", "gerente")),
):
    usuario = session.get(Usuario, login_id)
    # Para quem não é admin, o admin e as outras cooperativas simplesmente não existem
    if usuario is None or (
        atual.role != "admin"
        and (usuario.role == "admin" or usuario.cooperativa_id != atual.cooperativa_id)
    ):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Usuário não encontrado")

    if dados.active is not None:
        usuario.active = dados.active
        # inativar um catador libera a lixeira dele
        if not dados.active and usuario.role == "catador":
            for d in session.exec(select(Dispositivo).where(Dispositivo.catador_id == login_id)).all():
                d.catador_id = None
                session.add(d)
    if dados.name is not None:
        usuario.name = dados.name.strip()
    if dados.phone is not None:
        usuario.phone = dados.phone.strip() or None
    if dados.email is not None:
        usuario.email = dados.email.strip() or None

    session.add(usuario)
    session.commit()
    session.refresh(usuario)
    return para_front(usuario)


@router.get("/catadores")
def listar_catadores(
    cooperativa_id: int | None = None,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(usuario_atual),
):
    coop = coop_do_escopo(atual, cooperativa_id)
    consulta = select(Usuario).where(Usuario.role == "catador")
    if coop is not None:
        consulta = consulta.where(Usuario.cooperativa_id == coop)
    return [para_front(c) for c in session.exec(consulta).all()]
