"""Provides the public Book catalogue endpoint."""

from typing import Annotated

from fastapi import APIRouter, Query

from dependencies import DbSession
from schemas.book import PaginatedCatalogueResponse
from services.book_service import BookService

router = APIRouter(prefix="/catalogue", tags=["Public Catalogue"])
book_service = BookService()

Page = Annotated[int, Query(ge=1)]
PageSize = Annotated[int, Query(ge=1, le=100)]
Search = Annotated[str | None, Query(max_length=200)]
CategoryFilter = Annotated[int | None, Query(gt=0)]
LanguageFilter = Annotated[str | None, Query(max_length=100)]


@router.get("/books", response_model=PaginatedCatalogueResponse)
async def get_published_books(
    session: DbSession,
    page: Page = 1,
    size: PageSize = 10,
    search: Search = None,
    category_id: CategoryFilter = None,
    language: LanguageFilter = None,
):
    return await book_service.get_public_catalogue(
        session=session,
        page=page,
        page_size=size,
        search_query=search,
        category_id=category_id,
        language=language,
    )
