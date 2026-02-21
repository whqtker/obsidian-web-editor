# Obsidian Web Editor

GitHub-hosted Obsidian vault의 웹 CRUD 에디터 (React + Vite SPA).

## Tech Stack
React 18, TypeScript (strict), Vite 5, Tailwind CSS v4, Zustand, Octokit.js, CodeMirror 6, react-markdown, React Router v6

## Commands
- `npm run dev` — 개발 서버
- `npm run build` — `tsc -b && vite build`
- `npm run test:run` — Vitest 단회 실행
- `npm run test` — Vitest watch
- `npm run lint` — ESLint

## Architecture
[Browser SPA] ↔ [GitHub REST API] ↔ [Vault GitHub Repo]
- 백엔드 없음. 모든 API 호출은 브라우저에서 직접 수행.
- 상태관리: Zustand (authStore, repoStore, editorStore, treeStore, toastStore)
- 파일 트리: Git Tree API `recursive=1` 단일 요청
- 파일 CRUD: Contents API + SHA 기반 낙관적 잠금

## Project Structure
src/api/       — GitHub API 래퍼 (Octokit)
src/store/     — Zustand stores
src/hooks/     — 커스텀 훅
src/components/ — React 컴포넌트 (auth/, editor/, filetree/, layout/, ui/)
src/utils/     — 유틸리티 (pathUtils, base64, rateLimit)
src/types/     — TypeScript 타입 정의
src/test/      — 테스트 (tsconfig.test.json으로 분리)

## Conventions
- 경로 별칭: `@/` → `src/`
- npm install 시 반드시 `--legacy-peer-deps` 사용 (Node 18 + vitest 호환성)
- `.obsidian/` 디렉토리는 필터링/쓰기 차단
- UTF-8 base64: `TextEncoder`/`TextDecoder` 사용 (`btoa`/`atob` 금지)
- 작업 완료 후 CLAUDE.md에 반영이 필요한 변경사항이 있으면 업데이트할 것

## Phase Status
- Phase 0 (Bootstrap): ✅
- Phase 1 (MVP CRUD): ✅ — 인증, 레포 설정, 파일 트리, 에디터, 생성/삭제, ErrorBoundary, Toast, Spinner
- Phase 2 (Obsidian 기능): 미착수
- Phase 3 (고급 기능): 미착수
