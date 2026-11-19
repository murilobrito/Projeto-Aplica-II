from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps import exige_papel, usuario_atual
from app.models import Categoria, Grupo, Item, Usuario
from app.schemas import BasePriceIn, ItemPatch

router = APIRouter(tags=["categorias"])


def item_front(i: Item) -> dict:
    # nomes de campo iguais ao type Item do front (src/mocks/categorias.ts)
    d = {
        "id": i.id,
        "label": i.label,
        "price": i.price,
        "minConfidence": i.min_confidence,
        "active": i.active,
    }
    if i.hard:
        d["hard"] = True
    return d


@router.get("/categorias")
def listar_categorias(
    session: Session = Depends(get_session),
    _: Usuario = Depends(usuario_atual),
):
    categorias = session.exec(select(Categoria).order_by(Categoria.ordem)).all()
    saida = []
    for c in categorias:
        grupos = session.exec(
            select(Grupo).where(Grupo.categoria_id == c.id).order_by(Grupo.ordem)
        ).all()
        grupos_out = []
        for g in grupos:
            itens = session.exec(
                select(Item).where(Item.grupo_id == g.id).order_by(Item.ordem)
            ).all()
            grupos_out.append({"id": g.slug, "label": g.label, "items": [item_front(i) for i in itens]})
        categoria = {"id": c.id, "basePrice": c.base_price, "groups": grupos_out}
        if c.tag:
            categoria["tag"] = c.tag
        saida.append(categoria)
    return saida


@router.patch("/categorias/{categoria_id}")
def atualizar_base(
    categoria_id: str,
    dados: BasePriceIn,
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin", "gerente")),
):
    categoria = session.get(Categoria, categoria_id)
    if categoria is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria não encontrada")
    if dados.base_price < 0:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Preço não pode ser negativo")
    categoria.base_price = dados.base_price
    session.add(categoria)
    session.commit()
    return {"id": categoria.id, "basePrice": categoria.base_price}


@router.patch("/itens/{item_id}")
def atualizar_item(
    item_id: str,
    dados: ItemPatch,
    session: Session = Depends(get_session),
    _: Usuario = Depends(exige_papel("admin", "gerente")),
):
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item não encontrado")
    if dados.price is not None:
        if dados.price < 0:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Preço não pode ser negativo")
        item.price = dados.price
    if dados.min_confidence is not None:
        item.min_confidence = dados.min_confidence
    if dados.active is not None:
        item.active = dados.active
    session.add(item)
    session.commit()
    session.refresh(item)
    return item_front(item)
