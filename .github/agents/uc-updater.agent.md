---
name: uc-updater
description: Maintains the uc-updater repo, a TypeScript Docker container that flashes or resets UC microcontrollers over serial and OpenOCD.
---

# uc-updater agent

## Project overview

Node/TypeScript Docker container that flashes firmware to (or only resets) up to two UCs using `serialport` and OpenOCD.

- `src/index.ts`: entry point; reads env vars, validates paths, runs one `Flasher` per UC concurrently.
- `src/flasher.ts`: serial connection plus reset and program orchestration.
- `src/shell-service.ts`: shell command wrapper with a 5s timeout.
- `src/openocd/*.cfg`: OpenOCD reset/program configs per UC (GPIO pins are hardcoded).
- Env vars: `UC_1_PATH`, `UC_2_PATH`, `UC_1_BAUD`, `UC_2_BAUD`, `RESET_ONLY`.

## General rules

- Make minimal, focused changes; do not refactor unrelated code.
- Edit only `src/`. `build/` is gitignored and generated.
- Keep the existing TypeScript style (CommonJS, ES2016 target).
- Run `npm run format` (Prettier) before committing.
- Do not add dependencies unless necessary; Renovate/Dependabot manage updates.
- Keep UC1 and UC2 OpenOCD configs consistent; do not change GPIO pins unless asked.
- Never commit secrets or machine-specific device paths.
- Update `README.md` when env vars, usage, or wiring change.

## Git workflow

Write commit messages following [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

- Types: `feat`, `fix`, `docs`, `perf`, `refactor`, `style`, `test`, `ci`, `chore`, `revert` (these map to the changelog groups in `cliff.toml`).
- Scopes are optional but preferred, e.g. `flasher`, `shell-service`, `openocd`, `docker`, `deps`.
- Mark breaking changes with `!` (e.g. `feat(flasher)!: ...`) or a `BREAKING CHANGE:` footer.
- Use `chore(deps)` for dependency updates.
- **Pull request titles must also follow Conventional Commits format** (e.g. `feat(flasher): add reset-only mode`, `fix(shell-service): handle command timeout`). The PR title is used as the squash-merge commit message, so it must be valid.
- Branch from `main`; never push directly to `main`. Keep PRs small and focused.
- Do not edit the changelog or bump versions manually; releases are generated from commits by git-cliff in CI.

## Build and verify

- `npm run build`: clean build with `tsc` and copy OpenOCD configs into `build/`.
- `npm run build:start`: build and run.
- `npm run format`: Prettier.
- If a Dockerfile changes, make sure it still builds.

## Docker

- `Dockerfile.32`: 32-bit Raspberry Pi OS, Node 16, manually installed OpenOCD.
- `Dockerfile.64`: 64-bit, Node 22 alpine, OpenOCD from `apk`.
- Keep both in sync when changing runtime behaviour or copied files.

## CI/CD

- Workflows in `.github/workflows`: `ci.yml` orchestrates `build` → `prepare-release` → `make-release` → `docker`; release and Docker steps run only on `main`.
- Do not change the workflow structure unless the task requires it.
