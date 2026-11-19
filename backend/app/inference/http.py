import httpx
from fastapi import HTTPException, status

from app.inference.base import ResultadoInferencia
from app.materiais import CLASSES_MODELO_PARA_MATERIAL, material_valido


class InferenciaHTTP:
    """Fala com o serviço de inferência do colega (POST {url}/predict).

    Contrato esperado da resposta (ver para-o-colega/CONTRATO_INFERENCIA.md):
        {
          "material": "plastico",   # já em PT, ou uma classe do modelo (cardboard...)
          "title": "Garrafa PET",
          "confidence": 0.87,        # 0.0–1.0
          "quality": 0.7,            # opcional
          "model_version": "v1.0.0"
        }
    """

    def __init__(self, base_url: str, timeout: float = 15.0) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    async def classificar(self, imagem: bytes) -> ResultadoInferencia:
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.post(
                    f"{self.base_url}/predict",
                    files={"file": ("captura.jpg", imagem, "image/jpeg")},
                )
                resp.raise_for_status()
                dados = resp.json()
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Serviço de inferência indisponível: {exc}",
            ) from exc

        material = dados.get("material", "")
        # aceita tanto material PT quanto classe crua do modelo (inglês)
        if not material_valido(material):
            material = CLASSES_MODELO_PARA_MATERIAL.get(material, "outros")

        return ResultadoInferencia(
            material=material,
            title=dados.get("title") or "Item",
            description=dados.get("description"),
            confidence=float(dados.get("confidence", 0.0)),
            quality=dados.get("quality"),
            model_version=dados.get("model_version", "desconhecida"),
        )
