"""Pytest configuration and test-wide fixtures for BookHive backend tests."""

import os
from collections.abc import Generator

import pytest

# Ensure a test-safe SECRET_KEY (minimum 32 characters) is present in os.environ
# so that test runs and imports succeed even without a local .env file.
os.environ.setdefault(
    "SECRET_KEY",
    "test-jwt-secret-key-for-bookhive-unit-tests-min-32-chars",
)


@pytest.fixture(autouse=True)
def ensure_test_secret_key(monkeypatch: pytest.MonkeyPatch) -> Generator[None]:
    """Ensure tests run with a valid test secret key unless explicitly overridden."""
    monkeypatch.setenv(
        "SECRET_KEY",
        "test-jwt-secret-key-for-bookhive-unit-tests-min-32-chars",
    )
    yield
