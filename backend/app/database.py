from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from app.config import settings


def _resolver_url(url: str) -> str:
    # O Supabase entrega a string como postgresql://; direcionamos pro driver psycopg.
    for prefixo in ("postgresql://", "postgres://"):
        if url.startswith(prefixo):
            return "postgresql+psycopg://" + url[len(prefixo) :]
    return url


url = _resolver_url(settings.database_url)
sqlite = url.startswith("sqlite")

engine = create_engine(
    url,
    echo=False,
    connect_args={"check_same_thread": False} if sqlite else {},
    pool_pre_ping=not sqlite,  # o banco gerenciado derruba conexões ociosas; revalida antes de usar
)


def init_db() -> None:
    # importa os modelos para que SQLModel registre as tabelas
    from app import models  # noqa: F401

    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
