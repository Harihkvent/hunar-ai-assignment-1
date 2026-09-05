import base64
import hashlib
import hmac
import json
import time
from typing import Iterable, Optional


WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS = 300


def compute_hunar_signature(*, api_key: str, request_body: bytes, timestamp: str) -> str:
    """Computes one Base64 segment of X-Hunar-Signature for the given key, timestamp, and message bytes."""
    message = f"{timestamp.strip()}.".encode("utf-8") + request_body
    digest = hmac.new(api_key.encode("utf-8"), message, hashlib.sha256).digest()
    return base64.b64encode(digest).decode("ascii")


def verify_hunar_webhook_signature(
    *,
    signature_header: Optional[str],
    timestamp_header: Optional[str],
    request_body: bytes,
    trusted_api_keys: Iterable[str],
    tolerance_seconds: int = WEBHOOK_TIMESTAMP_TOLERANCE_SECONDS,
) -> bool:
    """True if timestamp is valid and any comma-separated signature matches any trusted key."""
    if not (signature_header and signature_header.strip()):
        return False
    if not (timestamp_header and timestamp_header.strip()):
        return False

    timestamp = timestamp_header.strip()

    # Verify timestamp skew if numeric
    try:
        ts_val = int(timestamp)
        now = int(time.time())
        if abs(now - ts_val) > tolerance_seconds:
            # Timestamp skew too large
            return False
    except ValueError:
        pass

    signatures = [s.strip() for s in signature_header.split(",") if s.strip()]
    for api_key in trusted_api_keys:
        if not api_key:
            continue
        computed = compute_hunar_signature(api_key=api_key, request_body=request_body, timestamp=timestamp)
        for signature in signatures:
            if hmac.compare_digest(signature, computed):
                return True

    return False
