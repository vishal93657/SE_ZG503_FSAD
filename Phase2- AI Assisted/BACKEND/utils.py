import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Union

SECRET_KEY = "e7ef52d3f235342f40302a9e5c7d12872b4e9b7d0c4f97e7b2b249b5d67f601f"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def hash_password(password: str) -> str:
    """
    Hashes a plain text password using bcrypt.

    Parameters
    ----------
    password : str
        The plain text password.

    Returns
    -------
    str
        The hashed password as a string.
    """
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain text password against a hashed password.

    Parameters
    ----------
    plain_password : str
        The plain text password input.
    hashed_password : str
        The stored hashed password.

    Returns
    -------
    bool
        True if the passwords match, False otherwise.
    """
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    """
    Creates a JWT access token with optional expiration time.

    Parameters
    ----------
    data : dict
        The data to encode in the token (e.g., {"sub": username}).
    expires_delta : Union[timedelta, None], optional
        The expiration time as a timedelta object. Defaults to 30 minutes.

    Returns
    -------
    str
        The encoded JWT access token.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    """
    Decodes and verifies a JWT access token.

    Parameters
    ----------
    token : str
        The JWT access token string.

    Returns
    -------
    dict or None
        The token payload (decoded data) if valid, otherwise None.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
