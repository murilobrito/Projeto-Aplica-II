from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps import usuario_atual
from app.models import Usuario
from app.schemas import LoginIn, LoginOut, UserOut
from app.security import conferir_senha, criar_token

router = APIRouter(prefix="/auth", tags=["auth"])


def para_userout(u: Usuario) -> UserOut:
    return UserOut(name=u.name, loginId=u.login_id, email=u.email, role=u.role)


@router.post("/login", response_model=LoginOut)
def login(dados: LoginIn, session: Session = Depends(get_session)):
    ident = dados.identifier.strip().lower()
    usuarios = session.exec(select(Usuario)).all()
    usuario = next(
        (u for u in usuarios if (u.email or "").lower() == ident or u.login_id.lower() == ident),
        None,
    )
    if usuario is None or not usuario.active or not conferir_senha(dados.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail/ID ou senha incorretos",
        )
    token = criar_token(usuario.login_id, usuario.role)
    return LoginOut(user=para_userout(usuario), token=token)


@router.get("/me", response_model=UserOut)
def me(usuario: Usuario = Depends(usuario_atual)):
    return para_userout(usuario)
