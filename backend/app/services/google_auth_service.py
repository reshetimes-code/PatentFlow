from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from app.core.config import get_settings

settings = get_settings()

_PLACEHOLDER_VALUES = {"", "your-google-client-id", "your-google-client-id.apps.googleusercontent.com"}
_request = google_requests.Request()


class GoogleSignInNotConfiguredError(RuntimeError):
    """Raised when GOOGLE_CLIENT_ID has not been configured yet."""


class InvalidGoogleCredentialError(ValueError):
    """Raised when the Google ID token fails verification."""


def verify_google_credential(credential: str) -> dict:
    """Verify a Google Identity Services ID token and return its payload
    (sub, email, email_verified, name, ...). Never trusts the token without
    verifying the signature and audience against our own configured client id
    — this is the same anti-hallucination discipline the platform applies to
    AI output: never accept an identity claim without verifying it."""

    client_id = (settings.GOOGLE_CLIENT_ID or "").strip()
    if client_id.lower() in _PLACEHOLDER_VALUES:
        raise GoogleSignInNotConfiguredError(
            "GOOGLE_CLIENT_ID is not configured. Create an OAuth Web Client ID at "
            "https://console.cloud.google.com/apis/credentials (Authorized JavaScript "
            "origin: http://localhost:3000), then set GOOGLE_CLIENT_ID in backend/.env "
            "and NEXT_PUBLIC_GOOGLE_CLIENT_ID in frontend/.env.local, and restart both servers."
        )

    try:
        payload = google_id_token.verify_oauth2_token(credential, _request, client_id)
    except ValueError as exc:
        raise InvalidGoogleCredentialError(str(exc)) from exc

    if not payload.get("email_verified", False):
        raise InvalidGoogleCredentialError("Google account email is not verified.")

    return payload
