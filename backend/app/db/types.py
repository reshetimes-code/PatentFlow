"""Portable column types that work identically on SQLite (local dev) and
Postgres (staging/production via docker-compose), so the same model code
runs against either engine without an #ifdef-per-dialect mess.
"""

import uuid

from sqlalchemy.types import CHAR, TypeDecorator, JSON as SA_JSON
from sqlalchemy.dialects.postgresql import UUID as PG_UUID


class GUID(TypeDecorator):
    """Platform-independent UUID column.

    Uses Postgres's native UUID type when available, otherwise stores as a
    stringified CHAR(36) (SQLite, etc.).
    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        if dialect.name == "postgresql":
            return str(value)
        if not isinstance(value, uuid.UUID):
            value = uuid.UUID(str(value))
        return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        if not isinstance(value, uuid.UUID):
            return uuid.UUID(str(value))
        return value


# Generic JSON column — maps to JSON on both SQLite and Postgres. Good enough
# for MVP structured-record / audit-log payloads; can be swapped for JSONB
# later if Postgres-only features (indexing into keys, etc.) are needed.
JSON = SA_JSON
