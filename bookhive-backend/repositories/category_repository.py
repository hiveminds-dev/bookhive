from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.category import Category
from schemas.category import CategoryCreate, CategoryUpdate


class CategoryRepository:
    async def get_by_id(self, session: AsyncSession, category_id: int) -> Category | None:
        result = await session.execute(
            select(Category).where(Category.id == category_id)
        )
        return result.scalars().first()

    async def get_by_name(self, session: AsyncSession, name: str) -> Category | None:
        result = await session.execute(
            select(Category).where(Category.name == name)
        )
        return result.scalars().first()


    async def category_create(
        self,
        session: AsyncSession,
        category_data: CategoryCreate,
    ) -> Category:
        category = Category(
            name=category_data.name.strip(),
            description=(
                category_data.description.strip()
                if category_data.description
                else None
            ),
        )
        session.add(category)
        await session.commit()
        await session.refresh(category)
        return category

    async def category_update(
            self,
            session: AsyncSession,
            category: Category,
            category_data: CategoryUpdate,
    ) -> Category:

        update_data = category_data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if isinstance(value, str):
                setattr(category, key, value.strip())
            else:
                setattr(category, key, value)

        session.add(category)
        await session.commit()
        await session.refresh(category)
        return category

