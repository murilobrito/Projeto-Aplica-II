from dataclasses import dataclass
from typing import Protocol, runtime_checkable


@dataclass
class ResultadoInferencia:
    """Formato único que o backend consome, venha do mock ou do modelo real."""

    material: str  # plastico | papel | metal | vidro | organico | outros
    title: str
    confidence: float  # 0.0–1.0
    description: str | None = None
    quality: float | None = None  # 2º semestre; nulo por enquanto
    model_version: str = "mock"


@runtime_checkable
class ClienteInferencia(Protocol):
    async def classificar(self, imagem: bytes) -> ResultadoInferencia: ...
