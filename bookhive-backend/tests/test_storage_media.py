"""Tests storage paths, media URL conversions, and security validation."""

from pathlib import Path

from config import BACKEND_DIR, Settings
from services.book_service import BookService


def test_settings_resolves_relative_storage_paths_to_backend_dir():
    custom_settings = Settings(
        book_storage_path=Path("custom_storage/books"),
        cover_storage_path=Path("custom_storage/covers"),
    )
    assert custom_settings.storage_root.is_absolute()
    assert custom_settings.storage_root == BACKEND_DIR / "storage"
    assert custom_settings.book_storage_path.is_absolute()
    assert custom_settings.book_storage_path == BACKEND_DIR / "custom_storage/books"
    assert custom_settings.cover_storage_path.is_absolute()
    assert custom_settings.cover_storage_path == BACKEND_DIR / "custom_storage/covers"


def test_to_public_storage_url_converts_valid_storage_path():
    assert (
        BookService._to_public_storage_url("storage/covers/cover_12.jpg")
        == "/storage/covers/cover_12.jpg"
    )
    assert (
        BookService._to_public_storage_url("/storage/books/book_1.pdf")
        == "/storage/books/book_1.pdf"
    )
    assert (
        BookService._to_public_storage_url("storage\\authors\\avatar.png")
        == "/storage/authors/avatar.png"
    )


def test_to_public_storage_url_preserves_external_urls():
    assert (
        BookService._to_public_storage_url("https://example.com/cover.jpg")
        == "https://example.com/cover.jpg"
    )
    assert (
        BookService._to_public_storage_url("http://example.com/cover.jpg")
        == "http://example.com/cover.jpg"
    )


def test_to_public_storage_url_rejects_unsafe_or_invalid_paths():
    assert BookService._to_public_storage_url(None) is None
    assert BookService._to_public_storage_url("") is None
    assert BookService._to_public_storage_url("   ") is None
    # Reject directory traversal attempts
    assert BookService._to_public_storage_url("storage/../etc/passwd") is None
    assert BookService._to_public_storage_url("../storage/covers/1.jpg") is None
    assert BookService._to_public_storage_url("storage/../../secret.key") is None
    # Reject non-storage paths
    assert BookService._to_public_storage_url("etc/passwd") is None
    assert BookService._to_public_storage_url("app/config.py") is None
