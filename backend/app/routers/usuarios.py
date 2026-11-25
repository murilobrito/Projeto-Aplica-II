from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.config import settings
from app.database import get_session
from app.deps import exige_papel, usuario_atual
from app.models import Dispositivo, Usuario
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
    }


# IDs automáticos: catadores 1xxx, gerente/coordenador 0xxx (igual ao front)
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


def vincular_catador(session: Session, device_id: int, catador_id: str | None) -> None:
    """Define o operador do dispositivo; um catador opera uma lixeira por vez."""
    for d in session.exec(select(Dispositivo)).all():
        if d.id == device_id:
            d.catador_id = catador_id
            session.add(d)
        elif catador_id and d.catador_id == catador_id:
            d.catador_id = None
            session.add(d)


@router.get("/usuarios")
def listar_usuarios(
    session: Session = Depends(get_session),
    atual: Usuario = Depends(exige_papel("admin", "gerente", "coordenador")),
):
    usuarios = session.exec(select(Usuario)).all()
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

    login_id = proximo_login_id(session, dados.role)
    novo = Usuario(
        login_id=login_id,
        name=dados.name.strip(),
        email=(dados.email or "").strip() or None,
        phone=dados.phone.strip() or None,
        role=dados.role,
        active=True,
        senha_hash=hash_senha(settings.seed_password),
    )
    session.add(novo)

    if dados.role == "catador" and dados.device_id:
        vincular_catador(session, dados.device_id, login_id)

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
    # Para quem não é admin, o admin simplesmente não existe
    if usuario is None or (usuario.role == "admin" and atual.role != "admin"):
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
    session: Session = Depends(get_session),
    _: Usuario = Depends(usuario_atual),
):
    catadores = session.exec(select(Usuario).where(Usuario.role == "catador")).all()
    return [para_front(c) for c in catadores]
