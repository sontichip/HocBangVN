# Secure Push Checklist (GitHub)

Use this before every push to avoid leaking API keys.

## 1) Keep secrets only in `.env`

- Put keys in local `.env` files only.
- Never hardcode keys in source files.
- `.gitignore` already blocks env files.

## 2) Run safe push check

PowerShell:

```powershell
cd D:\HocbangVN
.\scripts\safe-push.ps1
```

If you accidentally tracked `.env` in git:

```powershell
cd D:\HocbangVN
.\scripts\safe-push.ps1 -FixTrackedEnv
```

## 3) Commit only app files (not runtime/deps)

```powershell
cd D:\HocbangVN
git add src server php-backend .github .gitignore README-upload.md SECURE_PUSH.md scripts
```

Then inspect staged files:

```powershell
git diff --staged --name-only
```

## 4) Push

```powershell
git commit -m "feat: unify learning hub UI and secure push workflow"
git push origin <your-branch>
```

## 5) If key was exposed

- Revoke/rotate key immediately in provider console.
- Replace local `.env` with a new key.
- Re-run safe check script before pushing.
