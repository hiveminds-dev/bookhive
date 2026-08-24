"""Tests PDF and cover file validation and storage."""

from io import BytesIO
from pathlib import Path

import pytest
from fastapi import UploadFile
from PIL import Image
from pypdf import PdfReader, PdfWriter
from starlette.datastructures import Headers

from config import settings
from utils.file_handler import (
    FileTooLargeError,
    InvalidFileContentError,
    InvalidFileTypeError,
    save_cover,
    save_pdf,
)


def make_upload(
    *,
    filename: str,
    content: bytes,
    content_type: str,
) -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename=filename,
        headers=Headers(
            {
                "content-type": content_type,
            }
        ),
    )


def make_pdf() -> bytes:
    stream = BytesIO()
    writer = PdfWriter()

    writer.add_blank_page(
        width=100,
        height=100,
    )

    writer.write(stream)

    return stream.getvalue()


def make_image(
    image_format: str = "PNG",
) -> bytes:
    stream = BytesIO()

    image = Image.new(
        mode="RGB",
        size=(20, 30),
        color="blue",
    )

    image.save(
        stream,
        format=image_format,
    )

    return stream.getvalue()


@pytest.mark.asyncio
async def test_valid_pdf_is_saved(
    tmp_path,
    monkeypatch,
):
    storage_directory = tmp_path / "books"

    monkeypatch.setattr(
        settings,
        "book_storage_path",
        storage_directory,
    )

    upload = make_upload(
        filename="my-book.pdf",
        content=make_pdf(),
        content_type="application/pdf",
    )

    stored_path = await save_pdf(upload)
    stored_file = storage_directory / Path(stored_path).name

    assert stored_path.startswith("storage/books/")
    assert stored_file.exists()
    assert len(PdfReader(stored_file).pages) == 1


@pytest.mark.asyncio
async def test_invalid_pdf_content_is_rejected(
    tmp_path,
    monkeypatch,
):
    storage_directory = tmp_path / "books"

    monkeypatch.setattr(
        settings,
        "book_storage_path",
        storage_directory,
    )

    upload = make_upload(
        filename="fake.pdf",
        content=b"This is not a real PDF",
        content_type="application/pdf",
    )

    with pytest.raises(
        InvalidFileContentError,
        match="invalid or corrupted",
    ):
        await save_pdf(upload)

    assert list(storage_directory.iterdir()) == []


@pytest.mark.asyncio
async def test_non_pdf_extension_is_rejected():
    upload = make_upload(
        filename="book.txt",
        content=make_pdf(),
        content_type="application/pdf",
    )

    with pytest.raises(
        InvalidFileTypeError,
        match="Only PDF",
    ):
        await save_pdf(upload)


@pytest.mark.asyncio
async def test_pdf_size_limit_is_enforced(
    tmp_path,
    monkeypatch,
):
    storage_directory = tmp_path / "books"

    monkeypatch.setattr(
        settings,
        "book_storage_path",
        storage_directory,
    )

    monkeypatch.setattr(
        settings,
        "max_book_size_mb",
        0,
    )

    upload = make_upload(
        filename="book.pdf",
        content=make_pdf(),
        content_type="application/pdf",
    )

    with pytest.raises(
        FileTooLargeError,
        match="must not exceed",
    ):
        await save_pdf(upload)

    assert list(storage_directory.iterdir()) == []


@pytest.mark.asyncio
async def test_valid_png_cover_is_saved(
    tmp_path,
    monkeypatch,
):
    storage_directory = tmp_path / "covers"

    monkeypatch.setattr(
        settings,
        "cover_storage_path",
        storage_directory,
    )

    upload = make_upload(
        filename="cover.png",
        content=make_image("PNG"),
        content_type="image/png",
    )

    stored_path = await save_cover(upload)
    stored_file = storage_directory / Path(stored_path).name

    assert stored_path.startswith("storage/covers/")
    assert stored_file.exists()

    with Image.open(stored_file) as image:
        assert image.format == "PNG"


@pytest.mark.asyncio
async def test_cover_content_must_match_extension(
    tmp_path,
    monkeypatch,
):
    storage_directory = tmp_path / "covers"

    monkeypatch.setattr(
        settings,
        "cover_storage_path",
        storage_directory,
    )

    upload = make_upload(
        filename="cover.png",
        content=make_image("JPEG"),
        content_type="image/png",
    )

    with pytest.raises(
        InvalidFileContentError,
        match="does not match",
    ):
        await save_cover(upload)

    assert list(storage_directory.iterdir()) == []


@pytest.mark.asyncio
async def test_pdf_mime_type_is_validated():
    upload = make_upload(
        filename="book.pdf",
        content=make_pdf(),
        content_type="application/octet-stream",
    )

    with pytest.raises(
        InvalidFileTypeError,
        match="application/pdf",
    ):
        await save_pdf(upload)


@pytest.mark.asyncio
async def test_cover_size_limit_is_enforced(
    tmp_path,
    monkeypatch,
):
    storage_directory = tmp_path / "covers"

    monkeypatch.setattr(
        settings,
        "cover_storage_path",
        storage_directory,
    )

    monkeypatch.setattr(
        settings,
        "max_cover_size_mb",
        0,
    )

    upload = make_upload(
        filename="cover.png",
        content=make_image("PNG"),
        content_type="image/png",
    )

    with pytest.raises(
        FileTooLargeError,
        match="must not exceed",
    ):
        await save_cover(upload)

    assert list(storage_directory.iterdir()) == []