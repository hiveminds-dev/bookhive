from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db_session
from schemas.book import PaginatedCatalogueResponse
from services.book_service import BookService

router = APIRouter(prefix="/catalogue", tags=["Public Catalogue"])

book_service = BookService()
DbSession = Annotated[AsyncSession, Depends(get_db_session)]


@router.get("/books", response_model=PaginatedCatalogueResponse, status_code=status.HTTP_200_OK)
async def get_published_books(
        session: DbSession,
        page: Annotated[int, Query(ge=1, description="Page number to retrieve")] = 1,
        size: Annotated[int, Query(ge=1, le=100, description="Number of items per page")] = 10,
        search: Annotated[str | None, Query(description="Search by book title")] = None,
        category_id: Annotated[int | None, Query(description="Filter by category ID")] = None,
        language: Annotated[str | None, Query(description="Filter by language (e.g., English, Sinhala)")] = None,
):

    result = await book_service.get_public_catalogue(
        session=session,
        page=page,
        page_size=size,
        search_query=search,
        category_id=category_id,
        language=language
    )

    return result