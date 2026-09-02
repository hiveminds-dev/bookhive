from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, status
from httpx import ASGITransport, AsyncClient
from sqlalchemy.exc import SQLAlchemyError

from database import get_db_session
from dependencies import get_current_user
from main import app
from orm_models.book import Book, BookStatus
from orm_models.user import AccountStatus, User, UserRole
from schemas.admin_schemas import AdminActionSuccessResponse
from services.admin_service import AdminService
from services.auth_service import AccountAccessError, AuthService
from services.email_sender import EmailDeliveryError


def make_mock_session():
    session = AsyncMock()
    session.add = MagicMock()
    return session


async def override_database_session():
    yield make_mock_session()


async def override_admin_user():
    return SimpleNamespace(
        id=1,
        full_name="Samantha Reed",
        username="samanthar",
        email="samantha.reed@bookhive.com",
        role=UserRole.ADMIN,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
    )


async def override_reader_user():
    return SimpleNamespace(
        id=7,
        full_name="Liam Henderson",
        username="liamh",
        email="liam.henderson@mail.com",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
        email_verified=True,
    )


async def override_author_user():
    return SimpleNamespace(
        id=15,
        full_name="Eleanor Vance",
        username="eleanorv",
        email="eleanor.v@lumina.com",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.APPROVED,
        email_verified=True,
    )


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    app.dependency_overrides.clear()
    yield
    app.dependency_overrides.clear()


# ==============================================================================
# 1. API SUCCESS ACTIONS
# ==============================================================================


@pytest.mark.asyncio
async def test_admin_suspend_and_reactivate_reader_via_api():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.update_reader_status",
        new=AsyncMock(
            return_value=AdminActionSuccessResponse(
                success=True, message="Reader account has been suspended."
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.put(
                "/api/admin/readers/7/status",
                json={"status": "suspended"},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "suspended" in data["message"]


@pytest.mark.asyncio
async def test_admin_reset_reader_password_via_api():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.send_reader_password_reset",
        new=AsyncMock(
            return_value=AdminActionSuccessResponse(
                success=True,
                message="Password reset instructions have been emailed to liam.henderson@mail.com.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post("/api/admin/readers/7/reset-password")
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "emailed" in data["message"]
            assert "token" not in data
            assert "password" not in data


@pytest.mark.asyncio
async def test_admin_suspend_and_reactivate_author_via_api():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.update_author_status",
        new=AsyncMock(
            return_value=AdminActionSuccessResponse(
                success=True, message="Author account has been suspended."
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.put(
                "/api/admin/authors/15/status",
                json={"status": "suspended"},
            )
            assert resp.status_code == 200
            assert resp.json()["success"] is True


@pytest.mark.asyncio
async def test_admin_reset_author_password_via_api():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.send_author_password_reset",
        new=AsyncMock(
            return_value=AdminActionSuccessResponse(
                success=True,
                message="Password reset instructions have been emailed to eleanor.v@lumina.com.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post("/api/admin/authors/15/reset-password")
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "token" not in data


@pytest.mark.asyncio
async def test_admin_request_book_changes_via_api():
    app.dependency_overrides[get_current_user] = override_admin_user
    app.dependency_overrides[get_db_session] = override_database_session

    with patch(
        "routers.admin_router.admin_service.request_book_changes",
        new=AsyncMock(
            return_value=AdminActionSuccessResponse(
                success=True,
                message="Change request sent to author for 'Beyond Good and Evil'.",
            )
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            resp = await client.post(
                "/api/admin/books/1/request-changes",
                json={"feedback": "Please fix typographical errors in chapter 2."},
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["success"] is True
            assert "Change request sent" in data["message"]


# ==============================================================================
# 2. AUTHORIZATION & AUTHENTICATION TESTS (READER, AUTHOR, UNAUTHENTICATED)
# ==============================================================================


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "method,url,payload",
    [
        ("PUT", "/api/admin/readers/7/status", {"status": "suspended"}),
        ("POST", "/api/admin/readers/7/reset-password", None),
        ("PUT", "/api/admin/authors/15/status", {"status": "suspended"}),
        ("POST", "/api/admin/authors/15/reset-password", None),
        ("POST", "/api/admin/books/1/request-changes", {"feedback": "Please revise."}),
    ],
)
async def test_reader_cannot_perform_admin_operations(method, url, payload):
    app.dependency_overrides[get_current_user] = override_reader_user
    app.dependency_overrides[get_db_session] = override_database_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        if method == "PUT":
            resp = await client.put(url, json=payload)
        else:
            resp = await client.post(url, json=payload)

        assert resp.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "method,url,payload",
    [
        ("PUT", "/api/admin/readers/7/status", {"status": "suspended"}),
        ("POST", "/api/admin/readers/7/reset-password", None),
        ("PUT", "/api/admin/authors/15/status", {"status": "suspended"}),
        ("POST", "/api/admin/authors/15/reset-password", None),
        ("POST", "/api/admin/books/1/request-changes", {"feedback": "Please revise."}),
    ],
)
async def test_author_cannot_perform_admin_operations(method, url, payload):
    app.dependency_overrides[get_current_user] = override_author_user
    app.dependency_overrides[get_db_session] = override_database_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        if method == "PUT":
            resp = await client.put(url, json=payload)
        else:
            resp = await client.post(url, json=payload)

        assert resp.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize(
    "method,url,payload",
    [
        ("PUT", "/api/admin/readers/7/status", {"status": "suspended"}),
        ("POST", "/api/admin/readers/7/reset-password", None),
        ("PUT", "/api/admin/authors/15/status", {"status": "suspended"}),
        ("POST", "/api/admin/authors/15/reset-password", None),
        ("POST", "/api/admin/books/1/request-changes", {"feedback": "Please revise."}),
    ],
)
async def test_unauthenticated_request_returns_401(method, url, payload):
    app.dependency_overrides[get_db_session] = override_database_session

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        if method == "PUT":
            resp = await client.put(url, json=payload)
        else:
            resp = await client.post(url, json=payload)

        assert resp.status_code == 401


# ==============================================================================
# 3. MISSING RESOURCE (404) TESTS
# ==============================================================================


@pytest.mark.asyncio
async def test_missing_resource_operations_return_404():
    admin_svc = AdminService()
    session = make_mock_session()
    session.get.return_value = None

    # Unknown reader status update
    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_reader_status(session, 99999, "suspended")
    assert exc.value.status_code == 404
    assert "Reader not found" in exc.value.detail

    # Unknown reader password reset
    with pytest.raises(HTTPException) as exc:
        await admin_svc.send_reader_password_reset(session, 99999)
    assert exc.value.status_code == 404
    assert "Reader not found" in exc.value.detail

    # Unknown author status update
    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_author_status(session, 99999, "suspended")
    assert exc.value.status_code == 404
    assert "Author not found" in exc.value.detail

    # Unknown author password reset
    with pytest.raises(HTTPException) as exc:
        await admin_svc.send_author_password_reset(session, 99999)
    assert exc.value.status_code == 404
    assert "Author not found" in exc.value.detail

    # Unknown book request changes
    with pytest.raises(HTTPException) as exc:
        await admin_svc.request_book_changes(session, 99999, 1, "Feedback")
    assert exc.value.status_code == 404
    assert "Book not found" in exc.value.detail


# ==============================================================================
# 4. PASSWORD RESET FLOW & FAILURE TESTS
# ==============================================================================


@pytest.mark.asyncio
async def test_send_reader_password_reset_success_and_email_error():
    admin_svc = AdminService()
    session = make_mock_session()

    reader_user = User(
        id=7,
        full_name="Liam Reader",
        username="liamr",
        email="liam@example.com",
        password_hash="secret_hash",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
    )
    session.get.return_value = reader_user

    # Successful email dispatch
    with patch(
        "services.admin_service.PasswordResetService.request_reset",
        new=AsyncMock(return_value=None),
    ) as mock_reset:
        res = await admin_svc.send_reader_password_reset(session, 7)
        assert res.success is True
        mock_reset.assert_called_once_with(session, "liam@example.com")
        assert "token" not in res.model_dump()
        assert "password" not in res.model_dump()

    # Email delivery error returns 500 without false success
    with patch(
        "services.admin_service.PasswordResetService.request_reset",
        new=AsyncMock(side_effect=EmailDeliveryError("SMTP timeout")),
    ):
        with pytest.raises(HTTPException) as exc:
            await admin_svc.send_reader_password_reset(session, 7)
        assert exc.value.status_code == 500
        assert "mail delivery error" in exc.value.detail


@pytest.mark.asyncio
async def test_send_author_password_reset_success_and_email_error():
    admin_svc = AdminService()
    session = make_mock_session()

    author_user = User(
        id=15,
        full_name="Eleanor Author",
        username="eleanora",
        email="eleanor@example.com",
        password_hash="secret_hash",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.APPROVED,
    )
    session.get.return_value = author_user

    # Successful email dispatch
    with patch(
        "services.admin_service.PasswordResetService.request_reset",
        new=AsyncMock(return_value=None),
    ) as mock_reset:
        res = await admin_svc.send_author_password_reset(session, 15)
        assert res.success is True
        mock_reset.assert_called_once_with(session, "eleanor@example.com")
        assert "token" not in res.model_dump()

    # Email delivery error returns 500
    with patch(
        "services.admin_service.PasswordResetService.request_reset",
        new=AsyncMock(side_effect=EmailDeliveryError("Mail server refused connection")),
    ):
        with pytest.raises(HTTPException) as exc:
            await admin_svc.send_author_password_reset(session, 15)
        assert exc.value.status_code == 500


# ==============================================================================
# 5. REQUEST CHANGES END-TO-END RULES & STATUS TRANSITIONS
# ==============================================================================


@pytest.mark.asyncio
async def test_service_request_book_changes_rules():
    admin_svc = AdminService()
    session = make_mock_session()

    # Rule 1: Only PENDING_REVIEW can receive change request
    published_book = Book(
        id=1,
        title="Published Book",
        author_id=15,
        category_id=1,
        status=BookStatus.PUBLISHED,
    )
    session.get.return_value = published_book
    with pytest.raises(HTTPException) as exc:
        await admin_svc.request_book_changes(session, 1, 1, "Please revise.")
    assert exc.value.status_code == 409

    # Rule 2: Blank feedback returns 422
    pending_book = Book(
        id=2,
        title="Pending Book",
        author_id=15,
        category_id=1,
        status=BookStatus.PENDING_REVIEW,
    )
    session.get.return_value = pending_book
    with pytest.raises(HTTPException) as exc:
        await admin_svc.request_book_changes(session, 2, 1, "   ")
    assert exc.value.status_code == 422

    # Rule 3: Feedback longer than 500 chars returns 422
    with pytest.raises(HTTPException) as exc:
        await admin_svc.request_book_changes(session, 2, 1, "x" * 501)
    assert exc.value.status_code == 422

    # Rule 4 & 5: Valid request transitions book to DRAFT and saves log with admin_id
    res = await admin_svc.request_book_changes(
        session, 2, 1, "Please reformat chapter 1 headings."
    )
    assert res.success is True
    assert pending_book.status == BookStatus.DRAFT
    session.add.assert_called_once()
    added_log = session.add.call_args[0][0]
    assert added_log.admin_id == 1
    assert added_log.book_id == 2
    assert "Changes Requested: Please reformat chapter 1 headings." in added_log.reason

    # Rule 9: Repeated Request Changes on DRAFT returns 409
    session.get.return_value = pending_book  # now in DRAFT
    with pytest.raises(HTTPException) as exc:
        await admin_svc.request_book_changes(session, 2, 1, "Another change request")
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_service_update_reader_status_rules():
    admin_svc = AdminService()
    session = make_mock_session()

    # User is not a reader -> 404
    author_user = User(
        id=2,
        full_name="Author User",
        username="authoru",
        email="author@test.com",
        password_hash="hash",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.APPROVED,
    )
    session.get.return_value = author_user
    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_reader_status(session, 2, "suspended")
    assert exc.value.status_code == 404

    # Invalid status string -> 422
    reader_user = User(
        id=7,
        full_name="Reader User",
        username="readeru",
        email="reader@test.com",
        password_hash="hash",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
    )
    session.get.return_value = reader_user
    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_reader_status(session, 7, "invalid_status")
    assert exc.value.status_code == 422

    # Already active -> 409
    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_reader_status(session, 7, "active")
    assert exc.value.status_code == 409

    # Valid transition to suspended
    res = await admin_svc.update_reader_status(session, 7, "suspended")
    assert res.success is True
    assert reader_user.account_status == AccountStatus.SUSPENDED

    # Reactivate suspended reader
    res = await admin_svc.update_reader_status(session, 7, "active")
    assert res.success is True
    assert reader_user.account_status == AccountStatus.ACTIVE


@pytest.mark.asyncio
async def test_service_update_author_status_rules():
    admin_svc = AdminService()
    session = make_mock_session()

    # User is not an author -> 404
    reader_user = User(
        id=7,
        full_name="Reader User",
        username="readeru",
        email="reader@test.com",
        password_hash="hash",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
    )
    session.get.return_value = reader_user
    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_author_status(session, 7, "suspended")
    assert exc.value.status_code == 404

    # Author is pending review -> 409
    author_user = User(
        id=15,
        full_name="Author User",
        username="authoru",
        email="author@test.com",
        password_hash="hash",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.PENDING,
    )
    session.get.return_value = author_user
    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_author_status(session, 15, "suspended")
    assert exc.value.status_code == 409

    # Suspend approved author -> success
    author_user.account_status = AccountStatus.APPROVED
    res = await admin_svc.update_author_status(session, 15, "suspended")
    assert res.success is True
    assert author_user.account_status == AccountStatus.SUSPENDED

    # Reactivate suspended author -> success
    res = await admin_svc.update_author_status(session, 15, "approved")
    assert res.success is True
    assert author_user.account_status == AccountStatus.APPROVED


# ==============================================================================
# 6. TRANSACTION SAFETY & ROLLBACK ON COMMIT FAILURE TESTS
# ==============================================================================


@pytest.mark.asyncio
async def test_reader_status_rollback_on_commit_failure():
    admin_svc = AdminService()
    session = make_mock_session()

    reader_user = User(
        id=7,
        full_name="Reader Test",
        username="readert",
        email="reader@test.com",
        password_hash="hash",
        role=UserRole.READER,
        account_status=AccountStatus.ACTIVE,
    )
    session.get.return_value = reader_user
    session.commit.side_effect = SQLAlchemyError("DB Connection Lost")

    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_reader_status(session, 7, "suspended")

    assert exc.value.status_code == 500
    session.rollback.assert_awaited_once()


@pytest.mark.asyncio
async def test_author_status_rollback_on_commit_failure():
    admin_svc = AdminService()
    session = make_mock_session()

    author_user = User(
        id=15,
        full_name="Author Test",
        username="authort",
        email="author@test.com",
        password_hash="hash",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.APPROVED,
    )
    session.get.return_value = author_user
    session.commit.side_effect = SQLAlchemyError("DB Disk Full")

    with pytest.raises(HTTPException) as exc:
        await admin_svc.update_author_status(session, 15, "suspended")

    assert exc.value.status_code == 500
    session.rollback.assert_awaited_once()


@pytest.mark.asyncio
async def test_request_book_changes_rollback_on_commit_failure():
    admin_svc = AdminService()
    session = make_mock_session()

    pending_book = Book(
        id=3,
        title="Pending Book",
        author_id=15,
        category_id=1,
        status=BookStatus.PENDING_REVIEW,
    )
    session.get.return_value = pending_book
    session.commit.side_effect = SQLAlchemyError("Lock timeout")

    with pytest.raises(HTTPException) as exc:
        await admin_svc.request_book_changes(
            session, 3, 1, "Please revise preface."
        )

    assert exc.value.status_code == 500
    session.rollback.assert_awaited_once()


# ==============================================================================
# 7. AUTH SERVICE ACCESS BLOCKING FOR SUSPENDED USERS
# ==============================================================================


def test_auth_service_blocks_suspended_users():
    suspended_reader = User(
        id=7,
        full_name="Liam Henderson",
        username="liamh",
        email="liam@test.com",
        password_hash="hash",
        role=UserRole.READER,
        account_status=AccountStatus.SUSPENDED,
        email_verified=True,
    )
    with pytest.raises(AccountAccessError):
        AuthService._validate_account_access(suspended_reader)

    suspended_author = User(
        id=15,
        full_name="Eleanor Vance",
        username="eleanorv",
        email="eleanor@test.com",
        password_hash="hash",
        role=UserRole.AUTHOR,
        account_status=AccountStatus.SUSPENDED,
        email_verified=True,
    )
    with pytest.raises(AccountAccessError):
        AuthService._validate_account_access(suspended_author)
