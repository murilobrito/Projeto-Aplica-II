from pydantic import BaseModel


# ---------- Autenticação ----------
class LoginIn(BaseModel):
    identifier: str  # e-mail OU login_id (o front manda qualquer um dos dois)
    password: str


class UserOut(BaseModel):
    name: str
    loginId: str
    email: str | None = None
    role: str


class LoginOut(BaseModel):
    user: UserOut
    token: str


# ---------- Captura / classificação ----------
# Espelha o type Detection do front (src/mocks/captura.ts).
class Detection(BaseModel):
    material: str  # plastico | papel | metal | vidro | organico | outros
    title: str
    description: str
    confidence: int  # 1–5


class CorrecaoIn(BaseModel):
    detectado: str  # material que a IA disse
    corrigido: str  # material que o catador escolheu
    title: str | None = None
    confidence: int | None = None
    device_id: int | None = None
    coleta_id: int | None = None


# ---------- Gestão (escrita) ----------
class NovoUsuarioIn(BaseModel):
    name: str
    role: str  # gerente | coordenador | catador
    email: str | None = None
    phone: str
    device_id: int | None = None  # vincular a este dispositivo (só catador)


class UsuarioPatch(BaseModel):
    active: bool | None = None
    name: str | None = None
    phone: str | None = None
    email: str | None = None


class VinculoIn(BaseModel):
    catador_id: str | None = None  # None = desvincular


class BasePriceIn(BaseModel):
    base_price: float


class ItemPatch(BaseModel):
    price: float | None = None
    min_confidence: int | None = None
    active: bool | None = None


class CoopPatch(BaseModel):
    razao: str | None = None
    cnpj: str | None = None
    endereco: str | None = None
