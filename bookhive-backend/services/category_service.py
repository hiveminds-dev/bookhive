"""Handles Category rules."""

from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession


from repositories.category_repository import CategoryRepository
from schemas.category import CategoryCreate, CategoryUpdate
from orm_models.category import Category


class CategoryService:
    def __init__(self) :
        self.category_repository = CategoryRepository()

    async def create_category(
        self,
        session: AsyncSession,
        category_data: CategoryCreate,
    ) -> Category:

        existing_category = await self.category_repository.get_by_name(
            session, category_data.name.strip()
        )
        if existing_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists.",
            )

        return await self.category_repository.category_create(session, category_data)

    async def update_category(
            self,
            session: AsyncSession,
            category_id: int,
            category_data: CategoryUpdate,
    ) -> Category:

        category = await self.category_repository.get_by_id(session, category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Category with ID {category_id} not found"
            )


        if category_data.name and category_data.name != category.name:
            existing_category = await self.category_repository.get_by_name(session, category_data.name)
            if existing_category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category with this name already exists"
                )


        return await self.category_repository.category_update(session, category, category_data)

    async def get_category_by_id(self, session: AsyncSession, category_id: int) -> Category:
        category = await self.category_repository.get_by_id(session, category_id)
        if not category:
            raise ValueError("Category not found")
        return category
