from collections.abc import Iterator

from sqlalchemy import inspect, text
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
    migrar()

# create_all só cria tabelas que não existem; não acrescenta colunas em tabelas antigas.
# Esta migração leve cobre bancos criados antes do suporte a várias cooperativas
# (o SQLite local de cada um e o Supabase). Pode rodar quantas vezes quiser.
_COLUNAS_NOVAS = [
    ("cooperativa", "ativa", "BOOLEAN DEFAULT TRUE"),
    ("usuario", "cooperativa_id", "INTEGER REFERENCES cooperativa(id)"),
    ("dispositivo", "cooperativa_id", "INTEGER REFERENCES cooperativa(id)"),
    ("coleta", "cooperativa_id", "INTEGER REFERENCES cooperativa(id)"),
    ("correcao", "cooperativa_id", "INTEGER REFERENCES cooperativa(id)"),
]


def migrar() -> None:
    insp = inspect(engine)
    with engine.begin() as con:
        for tabela, coluna, tipo in _COLUNAS_NOVAS:
            existentes = {c["name"] for c in insp.get_columns(tabela)}
            if coluna not in existentes:
                con.execute(text(f"ALTER TABLE {tabela} ADD COLUMN {coluna} {tipo}"))

        # Tudo o que já existia pertencia à (única) cooperativa antiga.
        primeira = con.execute(text("SELECT MIN(id) FROM cooperativa")).scalar()
        if primeira is not None:
            con.execute(text("UPDATE cooperativa SET ativa = TRUE WHERE ativa IS NULL"))
            con.execute(
                text("UPDATE usuario SET cooperativa_id = :c WHERE cooperativa_id IS NULL AND role <> 'admin'"),
                {"c": primeira},
            )
            con.execute(
                text("UPDATE dispositivo SET cooperativa_id = :c WHERE cooperativa_id IS NULL"),
                {"c": primeira},
            )
            # coletas e correções herdam a cooperativa de quem as fez (as da demo, sem login, ficam sem)
            for tabela in ("coleta", "correcao"):
                con.execute(
                    text(
                        f"UPDATE {tabela} SET cooperativa_id = "
                        "(SELECT u.cooperativa_id FROM usuario u WHERE u.login_id = "
                        f"{tabela}.catador_id) WHERE cooperativa_id IS NULL"
                    )
                )

def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
