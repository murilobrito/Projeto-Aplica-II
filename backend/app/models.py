import datetime as dt

from sqlmodel import Field, SQLModel


def agora() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


class Usuario(SQLModel, table=True):
    login_id: str = Field(primary_key=True)  # ex.: RV-1024 (o "ID de usuário" do app)
    name: str
    email: str | None = Field(default=None, index=True)
    phone: str | None = None
    role: str  # admin | gerente | coordenador | catador
    active: bool = True
    senha_hash: str


class Dispositivo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    location: str
    active: bool = True
    catador_id: str | None = Field(default=None, foreign_key="usuario.login_id")
    battery: int = 100
    signal: str = "Boa"
    last_activity: str | None = None


class Coleta(SQLModel, table=True):
    """Cada item classificado e registrado pelo catador."""

    id: int | None = Field(default=None, primary_key=True)
    material: str  # plastico | papel | metal | vidro | organico | outros
    title: str
    confidence: int  # 1–5 (as bolinhas do app)
    quality: float | None = None  # diferencial do 2º semestre; nulo por enquanto
    foto_path: str | None = None
    model_version: str | None = None
    catador_id: str | None = Field(default=None, foreign_key="usuario.login_id")
    device_id: int | None = Field(default=None, foreign_key="dispositivo.id")
    created_at: dt.datetime = Field(default_factory=agora)


class Categoria(SQLModel, table=True):
    id: str = Field(primary_key=True)  # material: plastico | papel | metal | vidro | organico
    base_price: float
    tag: str | None = None
    ordem: int = 0


class Grupo(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    categoria_id: str = Field(foreign_key="categoria.id")
    slug: str  # único dentro da categoria (pode repetir entre categorias)
    label: str
    ordem: int = 0


class Item(SQLModel, table=True):
    id: str = Field(primary_key=True)  # slug global (ex.: plastico_pet_transparente)
    grupo_id: int = Field(foreign_key="grupo.id")
    label: str
    price: float  # R$/kg
    min_confidence: int = 90
    active: bool = True
    hard: bool = False
    ordem: int = 0


class Cooperativa(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    razao: str
    cnpj: str
    endereco: str


class Correcao(SQLModel, table=True):
    """Catador corrigiu a classificação da IA -> vira dado rotulado para re-treino."""

    id: int | None = Field(default=None, primary_key=True)
    coleta_id: int | None = Field(default=None, foreign_key="coleta.id")
    material_detectado: str
    material_corrigido: str
    title: str | None = None
    confidence: int | None = None
    foto_path: str | None = None
    model_version: str | None = None
    catador_id: str | None = Field(default=None, foreign_key="usuario.login_id")
    device_id: int | None = Field(default=None, foreign_key="dispositivo.id")
    created_at: dt.datetime = Field(default_factory=agora)
