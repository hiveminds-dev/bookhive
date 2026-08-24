"""Handles Category business rules."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.category import Category
from repositories.category_repository import CategoryRepository
from schemas.category import CategoryCreate, CategoryUpdate


class CategoryNotFoundError(ValueError):
    pass


class CategoryConflictError(ValueError):
    pass


class CategoryService:
    def __init__(self) -> None:
        self.category_repository = CategoryRepository()

    async def list_categories(
        self,
        session: AsyncSession,
        *,
        page: int,
        page_size: int,
    ) -> tuple[list[Category], int]:
        return await self.category_repository.list_categories(
            session,
            offset=(page - 1) * page_size,
            limit=page_size,
        )

    async def create_category(
        self,
        session: AsyncSession,
        category_data: CategoryCreate,
    ) -> Category:
        name = category_data.name.strip()
        description = self._normalize_optional_text(category_data.description)
        if await self.category_repository.get_by_name(session, name):
            raise CategoryConflictError(
                "Category with this name already exists"
            )

        try:
            category = await self.category_repository.create(
                session, name=name, description=description
            )
            await session.commit()
            await session.refresh(category)
            return category
        except Exception:
            await session.rollback()
            raise

    async def update_category(
        self,
        session: AsyncSession,
        category_id: int,
        category_data: CategoryUpdate,
    ) -> Category:
        category = await self.get_category_by_id(session, category_id)
        updates = category_data.model_dump(exclude_unset=True)

        if "name" in updates and updates["name"] is not None:
            name = str(updates["name"]).strip()
            if await self.category_repository.get_by_name(
                session, name, exclude_id=category.id
            ):
                raise CategoryConflictError(
                    "Category with this name already exists"
                )
            updates["name"] = name

        if "description" in updates:
            updates["description"] = self._normalize_optional_text(
                updates["description"]
            )

        try:
            updated_category = await self.category_repository.update(
                session, category, updates
            )
            await session.commit()
            await session.refresh(updated_category)
            return updated_category
        except Exception:
            await session.rollback()
            raise

    async def get_category_by_id(
        self,
        session: AsyncSession,
        category_id: int,
    ) -> Category:
        category = await self.category_repository.get_by_id(
            session, category_id
        )
        if category is None:
            raise CategoryNotFoundError("Category not found")
        return category

    @staticmethod
    def _normalize_optional_text(value: object) -> str | None:
        if value is None:
            return None
        normalized = str(value).strip()
        return normalized or None
