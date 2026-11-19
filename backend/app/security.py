import datetime as dt

import bcrypt
import jwt

from app.config import settings


def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def conferir_senha(senha: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(senha.encode(), hashed.encode())
    except ValueError:
        return False


def criar_token(sub: str, role: str) -> str:
    agora = dt.datetime.now(dt.timezone.utc)
    payload = {
        "sub": sub,
        "role": role,
        "iat": agora,
        "exp": agora + dt.timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def ler_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
