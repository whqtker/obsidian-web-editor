# Obsidian Web Editor

GitHub-hosted Obsidian vault의 웹 CRUD 에디터 (React + Vite SPA).

## Tech Stack
React 18, TypeScript (strict), Vite 5, Tailwind CSS v4, Zustand, Octokit.js, CodeMirror 6, react-markdown, React Router v6

## Commands
- `npm run dev` — 개발 서버 (OAuth 로컬 테스트 시 `node scripts/dev-auth-server.mjs` 별도 실행)
- `npm run build` — `tsc -b && vite build`
- `npm run test:run` — Vitest 단회 실행
- `npm run lint` — ESLint

## Architecture
- 백엔드 없음. 모든 API 호출은 브라우저에서 직접 수행
- 상태관리: Zustand (authStore, repoStore, editorStore, treeStore, toastStore)
- 인증: GitHub OAuth App → Vercel Serverless(`api/auth/callback.ts`)에서 code→token 교환
- 파일 CRUD: Contents API + SHA 기반 낙관적 잠금

## Project Structure
src/api/        — GitHub API 래퍼 (Octokit) + OAuth 헬퍼
src/store/      — Zustand stores
src/hooks/      — 커스텀 훅
src/components/ — React 컴포넌트 (auth/, editor/, filetree/, layout/, ui/)
src/utils/      — 유틸리티 (pathUtils, base64, rateLimit)
src/types/      — TypeScript 타입 정의
src/test/       — 테스트 (tsconfig.test.json으로 분리)

## Conventions
- 경로 별칭: `@/` → `src/`
- npm install 시 반드시 `--legacy-peer-deps` 사용 (`.npmrc`에 설정됨)
- `.obsidian/` 디렉토리는 필터링/쓰기 차단
- UTF-8 base64: `TextEncoder`/`TextDecoder` 사용 (`btoa`/`atob` 금지)
- OAuth 토큰은 `sessionStorage`에 저장 (탭 닫으면 만료)
- 에러 메시지는 한국어
- 작업 완료 후 CLAUDE.md에 반영이 필요한 변경사항이 있으면 업데이트할 것
