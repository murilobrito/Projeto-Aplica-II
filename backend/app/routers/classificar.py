from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlmodel import Session

from app.database import get_session
from app.deps import usuario_opcional
from app.inference import get_inference
from app.materiais import MATERIAIS, confianca_para_bolinhas
from app.models import Coleta, Usuario
from app.schemas import Detection
from app.storage import salvar_foto

router = APIRouter(tags=["captura"])


@router.post("/classificar", response_model=Detection)
async def classificar(
    file: UploadFile = File(...),
    device_id: int | None = Form(default=None),
    session: Session = Depends(get_session),
    usuario: Usuario | None = Depends(usuario_opcional),
):
    """Recebe a foto, pede a classificação (mock ou modelo real) e registra a coleta.
    Devolve no formato Detection que o front já conhece."""
    conteudo = await file.read()
    resultado = await get_inference().classificar(conteudo)

    # O modelo sinaliza "não reconheci nada" com confiança 0.0 (ex.: apontar para a
    # parede). Nesse caso não registramos coleta e pedimos para o app tentar de novo.
    if resultado.confidence <= 0.0:
        return Detection(
            material="outros",
            title=resultado.title or "Não identificado",
            description="Aproxime o item da câmera e tente de novo.",
            confidence=1,
            detectado=False,
        )

    bolinhas = confianca_para_bolinhas(resultado.confidence)
    descricao = resultado.description or f"{MATERIAIS.get(resultado.material, 'Item')} identificado"
    foto = salvar_foto(conteudo, file.filename)

    coleta = Coleta(
        material=resultado.material,
        title=resultado.title,
        confidence=bolinhas,
        quality=resultado.quality,
        foto_path=foto,
        model_version=resultado.model_version,
        catador_id=usuario.login_id if usuario else None,
        device_id=device_id,
    )
    session.add(coleta)
    session.commit()
    session.refresh(coleta)

    return Detection(
        material=resultado.material,
        title=resultado.title,
        description=descricao,
        confidence=bolinhas,
        detectado=True,
    )
