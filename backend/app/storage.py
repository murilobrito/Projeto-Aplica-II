import uuid
from pathlib import Path

PASTA_UPLOADS = Path(__file__).resolve().parent.parent / "uploads"


def salvar_foto(conteudo: bytes, nome_original: str | None) -> str:
    """Grava a foto capturada e devolve um caminho relativo para guardar no banco."""
    PASTA_UPLOADS.mkdir(parents=True, exist_ok=True)
    sufixo = Path(nome_original or "").suffix.lower() or ".jpg"
    nome = f"{uuid.uuid4().hex}{sufixo}"
    (PASTA_UPLOADS / nome).write_bytes(conteudo)
    return f"uploads/{nome}"
