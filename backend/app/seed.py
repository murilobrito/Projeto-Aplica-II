"""Popula o banco no primeiro boot com os mesmos dados do frontend,
para que login e telas funcionem sem cadastro manual."""

import datetime as dt
import random

from sqlmodel import Session, select

from app.config import settings
from app.database import engine
from app.materiais import MATERIAIS
from app.models import Categoria, Coleta, Cooperativa, Correcao, Dispositivo, Grupo, Item, Usuario
from app.security import hash_senha

# Mesmos usuários de src/mocks/users.ts + src/mocks/gestao.ts
USUARIOS = [
    ("EC-0001", "Equipe EcoTriall", "admin@ecotriall.com", None, "admin", True),
    ("RV-0001", "Ana Maria Castro", "gerente@ecotriall.com", "(11) 98765-4321", "gerente", True),
    ("RV-0002", "Carlos Santos", "coordenador@ecotriall.com", "(11) 97654-3210", "coordenador", True),
    ("RV-1024", "João Silva", "catador@ecotriall.com", "(11) 99123-4567", "catador", True),
    ("RV-1025", "Marcos Lima", None, "(11) 99234-5678", "catador", True),
    ("RV-1026", "Maria Oliveira", None, "(11) 99345-6789", "catador", True),
    ("RV-1027", "Lucas Santos", None, "(11) 99456-7890", "catador", True),
    ("RV-1028", "Juliana Santos", None, "(11) 99567-8901", "catador", False),
]

DISPOSITIVOS = [
    (1, "Lixeira Inteligente #01", "Galpão Principal - Setor A", True, "RV-1024", 94, "Excelente", "Há 2 min"),
    (2, "Lixeira Inteligente #02", "Área de Triagem Secundária", True, "RV-1026", 78, "Excelente", "Há 15 min"),
    (3, "Lixeira Inteligente #03", "Entrada Recepção de Lotes", False, "RV-1025", 12, "Excelente", "Ontem às 18:40"),
    (4, "Lixeira Inteligente #04", "Área Externa - Doca", True, "RV-1027", 66, "Boa", "Há 4 min"),
]

# Taxonomia de src/mocks/categorias.ts: (material, base_price, tag, grupos)
# grupo = (slug, label, itens);  item = (slug, label, price, hard)
CATEGORIAS = [
    ("plastico", 1.5, "Reciclável Especial", [
        ("pet", "PET (Polietileno Tereftalato)", [
            ("plastico_pet_transparente", "Transparente (Garrafas)", 2.2, False),
            ("plastico_pet_verde", "Verde (Bebidas/Gás)", 1.8, False),
            ("plastico_pet_colorido", "Colorido", 1.6, False),
        ]),
        ("pead", "PEAD (Polietileno de Alta Densidade)", [
            ("plastico_pead_branco", "Branco", 1.9, False),
            ("plastico_pead_colorido", "Colorido", 1.4, False),
        ]),
        ("pp", "PP (Polipropileno)", [("plastico_pp", "PP (Polipropileno)", 1.2, True)]),
        ("ps", "PS (Poliestireno)", [("plastico_ps", "PS (Poliestireno)", 0.8, True)]),
        ("filme", "Filme plástico", [("plastico_filme", "Filme plástico", 0.9, False)]),
    ]),
    ("papel", 1.0, None, [
        ("papelao", "Papelão", [("papel_papelao", "Papelão", 0.6, False)]),
        ("branco", "Papel branco", [("papel_branco", "Papel branco", 1.4, False)]),
        ("misto", "Papel misto", [("papel_misto", "Papel misto", 0.7, False)]),
        ("jornal", "Jornal/Revista", [("papel_jornal_revista", "Jornal/Revista", 0.5, False)]),
        ("cartonado", "Cartonado (longa vida)", [("papel_cartonado", "Cartonado (longa vida)", 0.4, False)]),
    ]),
    ("metal", 2.5, None, [
        ("lata_aluminio", "Lata de alumínio", [("metal_lata_aluminio", "Lata de alumínio", 6.0, False)]),
        ("lata_aco", "Lata de aço", [("metal_lata_aco", "Lata de aço", 0.8, True)]),
        ("aluminio_outro", "Alumínio (outros)", [("metal_aluminio_outro", "Alumínio (outros)", 4.5, False)]),
        ("outro", "Outros metais", [("metal_outro", "Outros metais", 1.5, False)]),
    ]),
    ("vidro", 0.5, None, [
        ("incolor", "Incolor", [("vidro_incolor", "Incolor", 0.6, False)]),
        ("verde", "Verde", [("vidro_verde", "Verde", 0.45, False)]),
        ("ambar", "Âmbar", [("vidro_ambar", "Âmbar", 0.45, False)]),
        ("outro", "Outro", [("vidro_outro", "Outro", 0.2, False)]),
    ]),
    ("organico", 0.1, None, [
        ("organico", "Orgânico", [("organico", "Orgânico", 0.1, False)]),
    ]),
]


def _seed_base(session: Session) -> None:
    if session.exec(select(Usuario)).first() is not None:
        return

    senha = hash_senha(settings.seed_password)
    for login_id, name, email, phone, role, active in USUARIOS:
        session.add(Usuario(login_id=login_id, name=name, email=email, phone=phone, role=role, active=active, senha_hash=senha))

    session.flush()  # grava os usuários antes: o dispositivo referencia o catador e o Postgres valida a FK na hora

    for id_, name, location, active, catador_id, battery, signal, last in DISPOSITIVOS:
        session.add(Dispositivo(id=id_, name=name, location=location, active=active, catador_id=catador_id, battery=battery, signal=signal, last_activity=last))


def _seed_categorias(session: Session) -> None:
    if session.exec(select(Categoria)).first() is not None:
        return

    for ci, (cid, base, tag, grupos) in enumerate(CATEGORIAS):
        session.add(Categoria(id=cid, base_price=base, tag=tag, ordem=ci))
        for gi, (gslug, glabel, itens) in enumerate(grupos):
            grupo = Grupo(categoria_id=cid, slug=gslug, label=glabel, ordem=gi)
            session.add(grupo)
            session.flush()  # garante grupo.id
            for ii, (islug, ilabel, price, hard) in enumerate(itens):
                session.add(Item(id=islug, grupo_id=grupo.id, label=ilabel, price=price, min_confidence=85 if hard else 90, active=True, hard=hard, ordem=ii))


def _seed_cooperativa(session: Session) -> None:
    if session.exec(select(Cooperativa)).first() is not None:
        return
    # de src/mocks/gestao.ts (COOP)
    session.add(Cooperativa(
        razao="Cooperativa Recicla Vida Ltda",
        cnpj="12.345.678/0001-90",
        endereco="Rua das Flores, 120 - Campinas/SP",
    ))


PESO_MIX = [("plastico", 42), ("papel", 28), ("metal", 15), ("vidro", 10), ("organico", 5)]


def _seed_coletas(session: Session) -> None:
    if session.exec(select(Coleta)).first() is not None:
        return
    sorteio = random.Random(42)
    pool = [material for material, peso in PESO_MIX for _ in range(peso)]
    catadores = ["RV-1024", "RV-1026", "RV-1027"]
    agora = dt.datetime.now(dt.timezone.utc)
    lote = []
    for _ in range(1850):
        material = sorteio.choice(pool)
        lote.append(Coleta(
            material=material,
            title=MATERIAIS[material],
            confidence=sorteio.choice([3, 4, 4, 5, 5]),
            catador_id=sorteio.choice(catadores),
            device_id=sorteio.randint(1, 4),
            created_at=agora - dt.timedelta(days=sorteio.randint(0, 29), minutes=sorteio.randint(0, 1439)),
        ))
    session.add_all(lote)


PARES_CORRECAO = [
    ("metal", "plastico"), ("papel", "plastico"), ("vidro", "plastico"), ("plastico", "papel"),
    ("papel", "metal"), ("plastico", "vidro"), ("organico", "papel"), ("metal", "vidro"),
]

# Correções de exemplo (device, catador, detectado, corrigido, confiança %, há quanto tempo)
CORRECOES = [
    (2, "RV-1026", "metal", "plastico", 84, dt.timedelta(minutes=10)),
    (1, "RV-1024", "papel", "plastico", 92, dt.timedelta(hours=1)),
    (4, "RV-1027", "vidro", "plastico", 79, dt.timedelta(hours=3)),
    (2, "RV-1026", "plastico", "papel", 96, dt.timedelta(hours=6)),
    (3, "RV-1025", "papel", "metal", 81, dt.timedelta(days=1, hours=2)),
    (1, "RV-1024", "plastico", "vidro", 89, dt.timedelta(days=3)),
    (4, "RV-1027", "organico", "papel", 93, dt.timedelta(days=5)),
    (2, "RV-1026", "metal", "vidro", 90, dt.timedelta(days=20)),
]


def _seed_correcoes(session: Session) -> None:
    # só semeia se ainda não há correções "de verdade" (com dispositivo)
    if any(c.device_id is not None for c in session.exec(select(Correcao)).all()):
        return
    agora = dt.datetime.now(dt.timezone.utc)
    for dev, cat, det, cor, conf, delta in CORRECOES:
        session.add(Correcao(
            device_id=dev,
            catador_id=cat,
            material_detectado=det,
            material_corrigido=cor,
            confidence=conf,
            created_at=agora - delta,
        ))
    # mais algumas espalhadas no mês para a taxa de correção ficar realista (~4%)
    sorteio = random.Random(7)
    catadores = ["RV-1024", "RV-1026", "RV-1027"]
    for _ in range(62):
        detectado, corrigido = sorteio.choice(PARES_CORRECAO)
        session.add(Correcao(
            device_id=sorteio.randint(1, 4),
            catador_id=sorteio.choice(catadores),
            material_detectado=detectado,
            material_corrigido=corrigido,
            confidence=sorteio.randint(78, 98),
            created_at=agora - dt.timedelta(days=sorteio.randint(0, 29), minutes=sorteio.randint(0, 1439)),
        ))


def seed() -> None:
    with Session(engine) as session:
        _seed_base(session)
        _seed_categorias(session)
        _seed_cooperativa(session)
        _seed_coletas(session)
        _seed_correcoes(session)
        session.commit()
