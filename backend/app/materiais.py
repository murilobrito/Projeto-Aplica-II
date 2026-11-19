"""Materiais do EcoTriagem — a fonte da verdade é o frontend (src/lib/materials.ts)."""

# Os 6 materiais que o app conhece.
MATERIAIS: dict[str, str] = {
    "plastico": "Plástico",
    "papel": "Papel",
    "metal": "Metal",
    "vidro": "Vidro",
    "organico": "Orgânico",
    "outros": "Outros",
}

# Tradução das classes do modelo (inglês) para os materiais do app (português).
# O modelo hoje treina em cardboard/metal/plastic (ver ecotriall-api/classificacao/split.py);
# os demais ficam mapeados para quando entrarem no treino.
CLASSES_MODELO_PARA_MATERIAL: dict[str, str] = {
    "cardboard": "papel",
    "paper": "papel",
    "metal": "metal",
    "plastic": "plastico",
    "glass": "vidro",
    "organic": "organico",
    "trash": "outros",
}


def material_valido(material: str) -> bool:
    return material in MATERIAIS


def confianca_para_bolinhas(confianca: float) -> int:
    """Converte a confiança 0.0–1.0 do modelo nas 1–5 bolinhas que o front espera."""
    return max(1, min(5, round(confianca * 5)))
