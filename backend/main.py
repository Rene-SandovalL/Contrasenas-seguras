from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYMBOLS = "!@#$%^&*"
LEET_MAP = {
    "a": "4",
    "e": "3",
    "i": "1",
    "o": "0",
    "s": "5",
    "t": "7",
}


class PasswordRequest(BaseModel):
    text: str


def to_leetspeak(word: str) -> str:
    return "".join(LEET_MAP.get(ch.lower(), ch) for ch in word)


def ensure_requirements(password: str) -> str:
    has_upper = any(ch.isupper() for ch in password)
    has_lower = any(ch.islower() for ch in password)
    has_digit = any(ch.isdigit() for ch in password)
    has_symbol = any(ch in SYMBOLS for ch in password)

    suffix = ""
    if not has_upper:
        suffix += "A"
    if not has_lower:
        suffix += "a"
    if not has_digit:
        suffix += "7"
    if not has_symbol:
        suffix += "!"

    password += suffix

    filler = "Xy9!"
    while len(password) < 12:
        password += filler

    return password


def normalize_words(text: str) -> list[str]:
    if "," in text:
        parts = [part.strip() for part in text.split(",") if part.strip()]
        words = [part.split()[0] for part in parts[:3] if part.split()]
    else:
        words = [w for w in text.split() if w][:5]

    if not words:
        words = ["clave", "segura", "fuerte"]

    return words


def build_variants(words: list[str]) -> list[str]:
    leet_words = [to_leetspeak(w) for w in words]

    variant_1 = "".join(leet_words)
    variant_2 = "_".join(w.capitalize() for w in reversed(leet_words))
    variant_3 = "-".join(w.upper() if i % 2 == 0 else w.lower() for i, w in enumerate(leet_words))

    raw_variants = [variant_1, variant_2, variant_3]
    secured = []

    for idx, raw in enumerate(raw_variants, start=1):
        candidate = ensure_requirements(raw)
        if candidate in secured:
            candidate = ensure_requirements(f"{candidate}{idx}!")
        secured.append(candidate)

    return secured


@app.post("/generate")
def generate_passwords(payload: PasswordRequest) -> dict:
    words = normalize_words(payload.text)
    passwords = build_variants(words)
    return {"passwords": passwords}
