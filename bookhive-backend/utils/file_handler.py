
"""Validates and stores PDF books and cover images."""

from __future__ import annotations

import asyncio
import os
import warnings
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError
from pypdf import PdfReader
from pypdf.errors import PdfReadError

from config import settings

UPLOAD_CHUNK_SIZE = 1024 * 1024

PDF_CONTENT_TYPES = {
    "application/pdf",
}

COVER_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

COVER_EXTENSIONS = {
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
    ".png": "PNG",
    ".webp": "WEBP",
}

PROFILE_IMAGE_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

PROFILE_IMAGE_EXTENSIONS = {
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
    ".png": "PNG",
    ".webp": "WEBP",
}


class FileUploadError(ValueError):
    """Base error for invalid file uploads."""


class InvalidFileTypeError(FileUploadError):
    """Raised when an unsupported file type is uploaded."""


class FileTooLargeError(FileUploadError):
    """Raised when an uploaded file exceeds its size limit."""


class InvalidFileContentError(FileUploadError):
    """Raised when uploaded file content is invalid or corrupted."""


async def save_pdf(upload: UploadFile) -> str:
    """Validate and save a PDF book file."""

    extension = _get_extension(upload)

    if extension != ".pdf":
        raise InvalidFileTypeError("Only PDF book files are allowed")

    if upload.content_type not in PDF_CONTENT_TYPES:
        raise InvalidFileTypeError(
            "The uploaded book must have the application/pdf content type"
        )

    storage_directory = settings.book_storage_path
    filename = f"{uuid4().hex}.pdf"

    return await _save_upload(
        upload=upload,
        storage_directory=storage_directory,
        public_directory=Path("storage/books"),
        filename=filename,
        max_size_mb=settings.max_book_size_mb,
        validator=_validate_pdf,
    )


async def save_cover(upload: UploadFile) -> str:
    """Validate and save a JPG or PNG book cover."""

    extension = _get_extension(upload)
    expected_format = COVER_EXTENSIONS.get(extension)

    if expected_format is None:
        raise InvalidFileTypeError(
            "Only JPG, JPEG, PNG, and WebP cover images are allowed"
        )

    if upload.content_type not in COVER_CONTENT_TYPES:
        raise InvalidFileTypeError(
            "The cover must have an image/jpeg, image/png, or image/webp content type"
        )

    storage_directory = settings.cover_storage_path
    filename = f"{uuid4().hex}{extension}"

    async def validate_cover(path: Path) -> None:
        await asyncio.to_thread(
            _validate_cover,
            path,
            expected_format,
        )

    return await _save_upload(
        upload=upload,
        storage_directory=storage_directory,
        public_directory=Path("storage/covers"),
        filename=filename,
        max_size_mb=settings.max_cover_size_mb,
        validator=validate_cover,
    )


async def save_profile_image(upload: UploadFile) -> str:
    """Validate and save a JPG, PNG, or WebP profile image."""

    extension = _get_extension(upload)
    expected_format = PROFILE_IMAGE_EXTENSIONS.get(extension)

    if expected_format is None:
        raise InvalidFileTypeError(
            "Only JPG, JPEG, PNG, and WebP profile images are allowed"
        )

    if upload.content_type not in PROFILE_IMAGE_CONTENT_TYPES:
        raise InvalidFileTypeError(
            "The profile image must have an image/jpeg, image/png, or image/webp content type"
        )

    storage_directory = settings.profile_image_storage_path
    filename = f"{uuid4().hex}{extension}"

    async def validate_profile_image(path: Path) -> None:
        await asyncio.to_thread(
            _validate_cover,
            path,
            expected_format,
        )

    return await _save_upload(
        upload=upload,
        storage_directory=storage_directory,
        public_directory=Path("storage/profiles"),
        filename=filename,
        max_size_mb=settings.max_profile_image_size_mb,
        validator=validate_profile_image,
    )


async def delete_stored_file(relative_path: str | None) -> None:
    """Delete a previously stored BookHive upload safely."""

    if not relative_path:
        return

    candidate = Path(relative_path)

    if not candidate.is_absolute():
        candidate = settings.storage_root.parent / candidate

    resolved_path = candidate.resolve()

    allowed_directories = {
        settings.book_storage_path.resolve(),
        settings.cover_storage_path.resolve(),
        settings.profile_image_storage_path.resolve(),
    }

    if resolved_path.parent not in allowed_directories:
        raise FileUploadError("Refusing to delete a file outside upload storage")

    await asyncio.to_thread(
        resolved_path.unlink,
        missing_ok=True,
    )


async def _save_upload(
    *,
    upload: UploadFile,
    storage_directory: Path,
    public_directory: Path,
    filename: str,
    max_size_mb: int,
    validator,
) -> str:
    """Stream, validate, and atomically store an upload."""

    storage_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    temporary_path = storage_directory / f".{uuid4().hex}.upload"
    final_path = storage_directory / filename
    max_size_bytes = max_size_mb * 1024 * 1024

    try:
        await _stream_to_disk(
            upload=upload,
            destination=temporary_path,
            max_size_bytes=max_size_bytes,
            max_size_mb=max_size_mb,
        )

        await validator(temporary_path)

        await asyncio.to_thread(
            os.replace,
            temporary_path,
            final_path,
        )

        return (public_directory / filename).as_posix()

    except Exception:
        await asyncio.to_thread(
            temporary_path.unlink,
            missing_ok=True,
        )
        raise


async def _stream_to_disk(
    *,
    upload: UploadFile,
    destination: Path,
    max_size_bytes: int,
    max_size_mb: int,
) -> None:
    """Write an upload in chunks while enforcing the size limit."""

    total_size = 0

    async with aiofiles.open(destination, "wb") as output:
        while True:
            chunk = await upload.read(UPLOAD_CHUNK_SIZE)

            if not chunk:
                break

            if total_size + len(chunk) > max_size_bytes:
                raise FileTooLargeError(
                    f"Uploaded file must not exceed {max_size_mb} MB"
                )

            await output.write(chunk)
            total_size += len(chunk)

    if total_size == 0:
        raise InvalidFileContentError("Uploaded file is empty")


async def _validate_pdf(path: Path) -> None:
    """Validate the structure of a PDF without blocking the event loop."""

    await asyncio.to_thread(
        _validate_pdf_sync,
        path,
    )


def _validate_pdf_sync(path: Path) -> None:
    """Validate PDF structure using pypdf."""

    try:
        reader = PdfReader(path)

        if reader.is_encrypted:
            raise InvalidFileContentError(
                "Encrypted PDF files are not supported"
            )

        if len(reader.pages) == 0:
            raise InvalidFileContentError(
                "The PDF must contain at least one page"
            )

    except InvalidFileContentError:
        raise

    except (PdfReadError, OSError, ValueError) as exc:
        raise InvalidFileContentError(
            "The uploaded PDF is invalid or corrupted"
        ) from exc


def _validate_cover(
    path: Path,
    expected_format: str,
) -> None:
    """Validate cover image content using Pillow."""

    try:
        with warnings.catch_warnings():
            warnings.simplefilter(
                "error",
                Image.DecompressionBombWarning,
            )

            with Image.open(path) as image:
                actual_format = image.format
                image.verify()

    except (
        UnidentifiedImageError,
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
        OSError,
        ValueError,
    ) as exc:
        raise InvalidFileContentError(
            "The uploaded cover image is invalid or corrupted"
        ) from exc

    if actual_format != expected_format:
        raise InvalidFileContentError(
            "The cover image content does not match its file extension"
        )


def _get_extension(upload: UploadFile) -> str:
    """Return the normalized extension of an uploaded file."""

    if not upload.filename:
        raise InvalidFileTypeError(
            "The uploaded file must have a filename"
        )

    return Path(upload.filename).suffix.lower()