"""Serviço de inferência do EcoTriagem — para rodar DENTRO do ecotriall-api.

Carrega o YOLO (detecção) + EfficientNet-B0 (classificação) UMA vez no startup e
expõe POST /predict seguindo o CONTRATO_INFERENCIA.md. Não altera o modelo nem o
treino — apenas serve o que já foi treinado.

Como rodar:
    pip install -r requirements_serving.txt
    # ajuste CAMINHO_CLASSIFICADOR e CAMINHO_YOLO abaixo
    uvicorn serving_app:app --port 8001
"""

import io

import torch
from fastapi import FastAPI, UploadFile
from PIL import Image
from torch import nn
from torchvision import models, transforms
from ultralytics import YOLO

# ------------------------------------------------------------------ configuração
# Ajuste para os seus arquivos de peso:
CAMINHO_CLASSIFICADOR = r"D:\projeto\eco-triagem\modelos\melhor_modelo.pth"
CAMINHO_YOLO = r"D:\projeto\eco-triagem\runs\garrafa_v1\weights\best.pt"
YOLO_CONF = 0.6
MODEL_VERSION = "efficientnet-b0 + yolo"

# Tradução classe-do-modelo -> material-do-app (igual ao backend).
CLASSE_PARA_MATERIAL = {
    "cardboard": "papel",
    "paper": "papel",
    "metal": "metal",
    "plastic": "plastico",
    "glass": "vidro",
    "organic": "organico",
    "trash": "outros",
}
TITULO = {
    "plastico": "Plástico",
    "papel": "Papel",
    "metal": "Metal",
    "vidro": "Vidro",
    "organico": "Orgânico",
    "outros": "Outros",
}

# Pré-processamento idêntico ao de classificacao/dados.py (transform_avaliacao).
MEDIA = [0.485, 0.456, 0.406]
DESVIO = [0.229, 0.224, 0.225]
preparar = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(MEDIA, DESVIO),
])

dispositivo = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ------------------------------------------------------------------ carregamento
def carregar_classificador():
    checkpoint = torch.load(CAMINHO_CLASSIFICADOR, map_location=dispositivo)
    classes = checkpoint["classes"]
    modelo = models.efficientnet_b0(weights=None)
    modelo.classifier[1] = nn.Linear(modelo.classifier[1].in_features, len(classes))
    modelo.load_state_dict(checkpoint["pesos"])
    return modelo.to(dispositivo).eval(), classes


app = FastAPI(title="EcoTriagem — inferência", version="1.0.0")
classificador, CLASSES = carregar_classificador()
try:
    detector = YOLO(CAMINHO_YOLO)
except Exception:
    detector = None  # sem YOLO ainda: classifica a imagem inteira


def recortar_objeto(imagem: Image.Image) -> Image.Image:
    """Usa o YOLO para achar o objeto principal e recortar. Sem detecção, devolve a imagem toda."""
    if detector is None:
        return imagem
    resultado = detector.predict(imagem, conf=YOLO_CONF, verbose=False)[0]
    if resultado.boxes is None or len(resultado.boxes) == 0:
        return imagem
    melhor = resultado.boxes[int(resultado.boxes.conf.argmax())]
    x1, y1, x2, y2 = (int(v) for v in melhor.xyxy[0].tolist())
    return imagem.crop((x1, y1, x2, y2))


@app.get("/")
def status():
    return {"servico": "inferencia", "classes": CLASSES, "yolo": detector is not None}


@app.post("/predict")
async def predict(file: UploadFile):
    imagem = Image.open(io.BytesIO(await file.read())).convert("RGB")
    recorte = recortar_objeto(imagem)

    tensor = preparar(recorte).unsqueeze(0).to(dispositivo)
    with torch.no_grad():
        probabilidades = torch.softmax(classificador(tensor), dim=1)[0]
    indice = int(probabilidades.argmax())
    confianca = float(probabilidades[indice])

    classe = CLASSES[indice]
    material = CLASSE_PARA_MATERIAL.get(classe, "outros")

    return {
        "material": material,
        "title": TITULO.get(material, classe),
        "confidence": confianca,
        "quality": None,
        "model_version": MODEL_VERSION,
    }
