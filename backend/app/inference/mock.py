import random

from app.inference.base import ResultadoInferencia

# Mesmas amostras do mock do frontend (src/mocks/captura.ts), já em material PT.
AMOSTRAS = [
    ("plastico", "Garrafa Plástica", "Garrafa pet descartada", 0.82),
    ("papel", "Caixa de Papelão", "Caixa de papelão dobrada", 0.93),
    ("metal", "Lata de Alumínio", "Lata de refrigerante", 0.78),
    ("vidro", "Garrafa de Vidro", "Garrafa de vidro verde", 0.64),
    ("organico", "Resto Orgânico", "Casca de fruta", 0.60),
]


class InferenciaMock:
    """Devolve uma predição falsa. Não depende do modelo do colega —
    serve para desenvolver e testar o fluxo ponta a ponta."""

    def __init__(self) -> None:
        self._ultimo: str | None = None

    async def classificar(self, imagem: bytes) -> ResultadoInferencia:
        opcoes = [a for a in AMOSTRAS if a[0] != self._ultimo] or AMOSTRAS
        material, title, description, confidence = random.choice(opcoes)
        self._ultimo = material
        return ResultadoInferencia(
            material=material,
            title=title,
            description=description,
            confidence=confidence,
            model_version="mock",
        )
