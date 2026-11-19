from functools import lru_cache

from app.config import settings
from app.inference.base import ClienteInferencia, ResultadoInferencia
from app.inference.http import InferenciaHTTP
from app.inference.mock import InferenciaMock

__all__ = ["ClienteInferencia", "ResultadoInferencia", "get_inference"]


@lru_cache
def get_inference() -> ClienteInferencia:
    if settings.inference_mode == "http":
        return InferenciaHTTP(settings.inference_url)
    return InferenciaMock()
