"""Handles Category database operations."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.category import Category


class CategoryRepository:
    async def get_by_id(
        self, session: AsyncSession, category_id: int
    ) -> Category | None:
        result = await session.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalar_one_or_none()

    async def get_by_name(
        self,
        session: AsyncSession,
        name: str,
        exclude_id: int | None = None,
    ) -> Category | None:
        query = select(Category).where(
            func.lower(Category.name) == name.strip().lower()
        )
        if exclude_id is not None:
            query = query.where(Category.id != exclude_id)
        result = await session.execute(query)
        return result.scalar_one_or_none()

    async def create(
        self,
        session: AsyncSession,
        *,
        name: str,
        description: str | None,
    ) -> Category:
        category = Category(name=name, description=description)
        session.add(category)
        await session.flush()
        return category

    async def update(
        self,
        session: AsyncSession,
        category: Category,
        updates: dict[str, object],
    ) -> Category:
        for field, value in updates.items():
            setattr(category, field, value)
        await session.flush()
        return category
