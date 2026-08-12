"""Handles Author rules."""
from sqlalchemy.ext.asyncio import AsyncSession

from orm_models.user import User, UserRole
from repositories.author_repository import AuthorRepository
from schemas.author import AuthorCreate


class AuthorService:

    def __init__(self):
        self.author_repository = AuthorRepository()

    async def create_author(self, session: AsyncSession, author_data: AuthorCreate):

        user = await session.get(User, author_data.user_id)

        if not user:
            raise ValueError("User not found")

        if user.role != UserRole.AUTHOR:
            raise ValueError("Only users with AUTHOR role can create an author profile")

        existing_author = await (self.author_repository.
                                 get_author_by_user_id(session, author_data.user_id))

        if existing_author:
            raise ValueError("This user already has an author profile" )

        author = await self.author_repository.author_create(session, author_data)

        await session.commit()

        return author
