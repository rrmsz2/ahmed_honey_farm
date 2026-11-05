"""Password hashing, JWT tokens and OTP helpers."""

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
import jwt

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:
        return False


# A valid hash used to keep login timing constant when the user does not exist.
DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(16))


def create_access_token(subject: str, secret: str, expire_minutes: int) -> str:
    now = datetime.now(UTC)
    payload = {"sub": subject, "iat": now, "exp": now + timedelta(minutes=expire_minutes)}
    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def decode_access_token(token: str, secret: str) -> dict | None:
    try:
        return jwt.decode(token, secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None


def generate_otp(length: int = 6) -> str:
    return "".join(secrets.choice("0123456789") for _ in range(length))


def hash_otp(code: str, order_id: str, secret: str) -> str:
    """OTPs are stored as keyed hashes, never in plain text."""
    return hmac.new(secret.encode(), f"{order_id}:{code}".encode(), hashlib.sha256).hexdigest()


def otp_matches(code: str, order_id: str, secret: str, expected_hash: str) -> bool:
    return hmac.compare_digest(hash_otp(code, order_id, secret), expected_hash)
