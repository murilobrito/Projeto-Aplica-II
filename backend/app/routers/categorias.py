from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.deps import coop_do_escopo, exige_papel, usuario_atual
from app.models import AjusteItem, Categoria, Grupo, Item, PrecoBase, Usuario
from app.schemas import BasePriceIn, ItemPatch

router = APIRouter(tags=["categorias"])

# O catálogo (categorias, grupos e itens) é da plataforma. Cada cooperativa só muda
# preço, confiança mínima e ativo por cima dele (tabelas PrecoBase e AjusteItem).
# Sem cooperativa em foco (admin sem ?cooperativa_id), valem e se editam os padrões.


def item_front(i: Item, ajuste: AjusteItem | None = None) -> dict:
    # nomes de campo iguais ao type Item do front (src/mocks/categorias.ts)
    d = {
        "id": i.id,
        "label": i.label,
        "price": ajuste.price if ajuste and ajuste.price is not None else i.price,
        "minConfidence": (
            ajuste.min_confidence if ajuste and ajuste.min_confidence is not None else i.min_confidence
        ),
        "active": ajuste.active if ajuste and ajuste.active is not None else i.active,
    }
    if i.hard:
        d["hard"] = True
    return d


@router.get("/categorias")
def listar_categorias(
    cooperativa_id: int | None = None,  # só vale para o admin
    session: Session = Depends(get_session),
    atual: Usuario = Depends(usuario_atual),
):
    coop = coop_do_escopo(atual, cooperativa_id)
    bases: dict[str, float] = {}
    ajustes: dict[str, AjusteItem] = {}
    if coop is not None:
        bases = {
            p.categoria_id: p.base_price
            for p in session.exec(select(PrecoBase).where(PrecoBase.cooperativa_id == coop)).all()
        }
        ajustes = {
            a.item_id: a
            for a in session.exec(select(AjusteItem).where(AjusteItem.cooperativa_id == coop)).all()
        }

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
            grupos_out.append(
                {"id": g.slug, "label": g.label, "items": [item_front(i, ajustes.get(i.id)) for i in itens]}
            )
        categoria = {"id": c.id, "basePrice": bases.get(c.id, c.base_price), "groups": grupos_out}
        if c.tag:
            categoria["tag"] = c.tag
        saida.append(categoria)
    return saida


@router.patch("/categorias/{categoria_id}")
def atualizar_base(
    categoria_id: str,
    dados: BasePriceIn,
    cooperativa_id: int | None = None,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(exige_papel("admin", "gerente")),
):
    coop = coop_do_escopo(atual, cooperativa_id)
    categoria = session.get(Categoria, categoria_id)
    if categoria is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria não encontrada")
    if dados.base_price < 0:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Preço não pode ser negativo")

    if coop is None:  # admin mexendo no padrão da plataforma
        categoria.base_price = dados.base_price
        session.add(categoria)
        preco = dados.base_price
    else:
        base = session.get(PrecoBase, (coop, categoria_id)) or PrecoBase(
            cooperativa_id=coop, categoria_id=categoria_id, base_price=dados.base_price
        )
        base.base_price = dados.base_price
        session.add(base)
        preco = base.base_price
    session.commit()
    return {"id": categoria.id, "basePrice": preco}


@router.patch("/itens/{item_id}")
def atualizar_item(
    item_id: str,
    dados: ItemPatch,
    cooperativa_id: int | None = None,
    session: Session = Depends(get_session),
    atual: Usuario = Depends(exige_papel("admin", "gerente")),
):
    coop = coop_do_escopo(atual, cooperativa_id)
    item = session.get(Item, item_id)
    if item is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item não encontrado")
    if dados.price is not None and dados.price < 0:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Preço não pode ser negativo")

    ajuste = None
    if coop is None:  # padrão da plataforma
        alvo = item
    else:
        ajuste = session.get(AjusteItem, (coop, item_id)) or AjusteItem(cooperativa_id=coop, item_id=item_id)
        alvo = ajuste
    if dados.price is not None:
        alvo.price = dados.price
    if dados.min_confidence is not None:
        alvo.min_confidence = dados.min_confidence
    if dados.active is not None:
        alvo.active = dados.active
    session.add(alvo)
    session.commit()
    session.refresh(item)
    if ajuste is not None:
        session.refresh(ajuste)
    return item_front(item, ajuste)
