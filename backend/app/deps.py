from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session

from app.database import get_session
from app.models import Cooperativa, Usuario
from app.security import ler_token

_NAO_AUTORIZADO = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token ausente ou inválido",
    headers={"WWW-Authenticate": "Bearer"},
)


def usuario_atual(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
) -> Usuario:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise _NAO_AUTORIZADO

    token = authorization.split(" ", 1)[1].strip()
    try:
        dados = ler_token(token)
    except Exception as exc:  # token expirado/adulterado
        raise _NAO_AUTORIZADO from exc

    usuario = session.get(Usuario, dados.get("sub"))
    if usuario is None or not usuario.active:
        raise _NAO_AUTORIZADO
    # cooperativa desativada = ninguém dela entra (o admin da plataforma não tem cooperativa)
    if usuario.cooperativa_id is not None:
        coop = session.get(Cooperativa, usuario.cooperativa_id)
        if coop is not None and not coop.ativa:
            raise _NAO_AUTORIZADO
    return usuario


def usuario_opcional(
    authorization: str | None = Header(default=None),
    session: Session = Depends(get_session),
) -> Usuario | None:
    """Como usuario_atual, mas não falha se não houver token.
    Usado na captura, que é pública (ver CapturaPage.tsx)."""
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    try:
        dados = ler_token(authorization.split(" ", 1)[1].strip())
    except Exception:
        return None
    usuario = session.get(Usuario, dados.get("sub"))
    return usuario if usuario and usuario.active else None


def exige_papel(*papeis: str):
    """Dependência para proteger rotas por papel (ex.: só gerente/coordenador)."""

    def _checar(usuario: Usuario = Depends(usuario_atual)) -> Usuario:
        if usuario.role not in papeis:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seu perfil não tem acesso a este recurso",
            )
        return usuario

    return _checar

def coop_do_escopo(usuario: Usuario, cooperativa_id: int | None = None) -> int | None:
    """Em qual cooperativa esta requisição pode mexer.

    - Gerente, coordenador e catador: sempre a própria, não importa o que mandarem.
    - Admin (equipe EcoTriall): todas (None) ou a que ele pedir com ?cooperativa_id=.
    Toda consulta de dados de cooperativa DEVE passar por aqui.
    """
    if usuario.role == "admin":
        return cooperativa_id
    if usuario.cooperativa_id is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Usuário sem cooperativa")
    return usuario.cooperativa_id