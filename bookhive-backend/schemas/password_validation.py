import re

PASSWORD_COMPLEXITY_MESSAGE = (
    "Password must contain at least one uppercase letter, one lowercase letter, "
    "one number, and one special character."
)


def validate_password_complexity(password: str) -> str:
    if not re.search(r"[A-Z]", password):
        raise ValueError(PASSWORD_COMPLEXITY_MESSAGE)
    if not re.search(r"[a-z]", password):
        raise ValueError(PASSWORD_COMPLEXITY_MESSAGE)
    if not re.search(r"\d", password):
        raise ValueError(PASSWORD_COMPLEXITY_MESSAGE)
    if not re.search(r"[^A-Za-z0-9]", password):
        raise ValueError(PASSWORD_COMPLEXITY_MESSAGE)
    return password
