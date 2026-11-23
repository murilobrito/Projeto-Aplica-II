# Contrato de integração — serviço de inferência EcoTriagem

Este documento define **a única interface** entre o backend (que o Murilo mantém) e o
modelo (que o Hugo treina e serve no `ecotriall-api`). Enquanto a resposta respeitar este
formato, cada lado evolui sem quebrar o outro.

> Status: o serviço já foi implementado pelo Hugo (`serving_app.py` no `ecotriall-api`).
> Ele roda na máquina dele, que tem GPU, e passa a `INFERENCE_URL` na hora de testar junto.
> Até lá o backend usa um **mock**, então nada fica parado.

## O endpoint

```
POST {INFERENCE_URL}/predict
Content-Type: multipart/form-data
campo "file" = imagem (JPEG/PNG) capturada pelo celular
```

### Resposta — item reconhecido

```json
{
  "material": "plastico",
  "title": "Garrafa PET",
  "confidence": 0.87,
  "quality": null,
  "model_version": "yolo26n-garrafa-v2"
}
```

### Resposta — nada reconhecido

Quando o modelo não detecta nenhum objeto (ex.: a câmera apontada para a parede), ele
responde com confiança `0.0` e material `outros`. O app mostra "aproxime o item" em vez de
um resultado, e o backend **não registra** essa captura:

```json
{
  "material": "outros",
  "title": "Não identificado",
  "confidence": 0.0,
  "quality": null,
  "model_version": "yolo26n-garrafa-v2"
}
```

| Campo | Tipo | Regra |
|---|---|---|
| `material` | string | Um de: `plastico`, `papel`, `metal`, `vidro`, `organico`, `outros`. O serviço já traduz a classe do modelo para o material de topo. |
| `title` | string | Nome curto do objeto ("Garrafa PET", "Lata de alumínio") ou "Não identificado". |
| `confidence` | float | 0.0–1.0. O backend converte para as 1–5 bolinhas do app. `0.0` = nada reconhecido. |
| `quality` | float \| null | Qualidade/contaminação 0.0–1.0 (diferencial do 2º semestre). `null` por enquanto. |
| `model_version` | string | Identifica a versão do modelo que respondeu. |

## Classes

O serviço mantém, por dentro, o mapa classe-do-modelo → material do app (ex.:
`plastico_pet_transparente` → `plastico`, `metal_lata_aluminio` → `metal`). O backend
recebe só o material de topo, então **não precisa mudar** quando novas classes forem
treinadas — elas aparecem pelo `title`. Hoje só a garrafa PET está treinada.

## Pipeline (só YOLO)

A detecção e a classificação são feitas por um único modelo YOLO (Ultralytics): ele
devolve classe + confiança direto e cuida do pré-processamento da imagem internamente.
Não há mais etapa separada de recorte + classificador (EfficientNet), nem
redimensionamento/normalização do lado de quem chama o serviço.

## Rodar

O Hugo roda o serviço na máquina dele e passa a URL. No backend, é só apontar:
`INFERENCE_MODE=http` e `INFERENCE_URL=<url do Hugo>`.

```bash
pip install -r requirements_serving.txt
uvicorn serving_app:app --port 8001
```

> O `serving_app.py` que acompanha esta pasta era a referência inicial (EfficientNet + YOLO)
> e está **desatualizado**. A versão atual e correta é a do `ecotriall-api`, mantida pelo Hugo.
