# Contrato de integração — serviço de inferência EcoTriagem

Este documento define **a única interface** entre o backend (que o Murilo mantém) e o
modelo (que você treina no `ecotriall-api`). Enquanto a resposta respeitar este formato,
cada lado pode evoluir sem quebrar o outro.

## O endpoint

```
POST {INFERENCE_URL}/predict
Content-Type: multipart/form-data
campo "file" = imagem (JPEG/PNG) capturada pelo celular
```

### Resposta esperada (JSON)

```json
{
  "material": "plastico",
  "title": "Garrafa PET",
  "confidence": 0.87,
  "quality": null,
  "model_version": "efficientnet-b0-2026-11"
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `material` | string | Um de: `plastico`, `papel`, `metal`, `vidro`, `organico`, `outros`. **Pode** mandar a classe crua do modelo (`cardboard`, `metal`, `plastic`) — o backend traduz. |
| `title` | string | Nome curto do objeto (ex.: "Garrafa PET", "Lata de alumínio"). |
| `confidence` | float | 0.0–1.0 (o softmax). O backend converte para as 1–5 bolinhas do app. |
| `quality` | float \| null | Qualidade/contaminação 0.0–1.0 (diferencial do 2º semestre). Mande `null` por enquanto. |
| `model_version` | string | Identifica a versão do modelo que respondeu. |

## Pré-processamento (tem que bater com o treino)

Lido de `classificacao/dados.py` — se você mudar lá, **me avise**, porque muda aqui:

- Redimensiona para 256, corta no centro para **224×224**.
- Normaliza com média ImageNet `[0.485, 0.456, 0.406]` e desvio `[0.229, 0.224, 0.225]`.

## Mapa de classes (modelo → app)

Hoje o modelo treina em `["cardboard", "metal", "plastic"]` (`classificacao/split.py`):

| Classe do modelo | Material no app |
|---|---|
| `cardboard` | `papel` |
| `metal` | `metal` |
| `plastic` | `plastico` |
| (ainda não treinado) | `vidro`, `organico`, `outros` |

Quando `vidro`, `organico` e `outros` entrarem no treino, só me avisar para eu liberar no app.

## O que eu preciso de você (escolha um)

1. **Rodar o serviço você** na sua máquina (tem os pesos + GPU) e me passar a URL
   (`INFERENCE_URL`). Use o `serving_app.py` que mandei junto — é só colocar no `ecotriall-api`.
2. **Me enviar os dois arquivos de peso** (`melhor_modelo.pth` e `best.pt`) que eu rodo
   o serviço aqui. Nada muda no seu modelo — é só uma cópia dos arquivos.

Enquanto nenhum dos dois acontece, meu backend roda com um **mock** e o resto do sistema
não fica parado.

## Como rodar o serving (qualquer um dos cenários)

```bash
pip install -r requirements_serving.txt
# ajuste os caminhos dos pesos no topo de serving_app.py
uvicorn serving_app:app --port 8001
```

No backend, é só apontar para ele: `INFERENCE_MODE=http` e `INFERENCE_URL=http://localhost:8001`.
