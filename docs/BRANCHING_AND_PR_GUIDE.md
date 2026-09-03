# BookHive Branching and Pull Request Guide

## Branch roles

- `main`: stable/release history
- `develop`: integrated and reviewed development
- `feature/<short-name>`: one new capability
- `fix/<short-name>`: one correction
- `docs/<short-name>`: documentation-only work

Start from the latest development branch:

```bash
git checkout develop
git pull --ff-only origin develop
git checkout -b feature/example-name
```

Do not commit directly to `main` or `develop`.

## Commit format

```text
feat(auth): add email verification
fix(books): preserve current PDF page
docs(setup): document local seed workflow
test(admin): cover author approval rules
```

Include a Jira ID when the change belongs to a specific task. Do not invent an ID for unrelated maintenance.

## Pull request content

A PR should include a concise title, plain-language summary, affected areas, linked Jira task when applicable, tests performed, screenshots for material UI changes, known limitations, and confirmation that no secrets or private uploads were added.

## Required verification

```bash
cd bookhive-backend && pytest -q
cd ../bookhive-frontend && npm test -- --watch=false
npm run build
cd .. && git diff --check
```

For user-facing changes, perform the relevant flow in [TESTING_GUIDE.md](TESTING_GUIDE.md).

## Merge and cleanup

1. Target `develop`.
2. Resolve feedback on the same branch.
3. Wait for required checks.
4. Use the repository's selected merge strategy.
5. Update local `develop` after merge.
6. Delete the merged branch when no longer needed.

Never delete a branch containing work that has not been safely preserved.
