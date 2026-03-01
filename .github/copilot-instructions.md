# Obsidian Web Editor — Copilot Instructions

GitHub-hosted Obsidian vault의 웹 CRUD 에디터 (React + Vite SPA). 백엔드 없이 브라우저에서 GitHub API를 직접 호출한다.

## Tech Stack

- **Framework**: React 18, TypeScript (strict mode), Vite 5
- **Styling**: Tailwind CSS v4
- **State**: Zustand (authStore, repoStore, editorStore, treeStore, toastStore)
- **GitHub API**: Octokit.js
- **Editor**: CodeMirror 6
- **Markdown**: react-markdown + remark/rehype 플러그인
- **Routing**: React Router v6

## Project Structure

```text
src/api/        — GitHub API 래퍼 (Octokit) + OAuth 헬퍼
src/store/      — Zustand stores
src/hooks/      — 커스텀 훅
src/components/ — React 컴포넌트 (auth/, editor/, filetree/, layout/, ui/)
src/utils/      — 유틸리티 (pathUtils, base64, rateLimit)
src/types/      — TypeScript 타입 정의
src/test/       — Vitest 테스트 (tsconfig.test.json으로 분리)
api/            — Vercel Serverless Functions (OAuth callback)
```

## Architecture

- 백엔드 없음. 모든 GitHub API 호출은 브라우저에서 직접 수행
- 인증: GitHub OAuth App → Vercel Serverless(`api/auth/callback.ts`)에서 code→token 교환
- 파일 CRUD: GitHub Contents API + SHA 기반 낙관적 잠금
- OAuth 토큰은 `sessionStorage`에 저장 (탭 닫으면 만료)

## Git Workflow

- `feature/*` → PR → `develop` 머지 → PR → `main` 머지
- `develop` 브랜치: Vercel Preview 배포 (Dev OAuth App)
- `main` 브랜치: Vercel Production 배포 (Prod OAuth App)

## Commands

```bash
npm run build     # tsc -b && vite build
npm run test:run  # Vitest 단회 실행
npm run lint      # ESLint
```

## Coding Conventions

- **경로 별칭**: `@/` → `src/`
- **패키지 설치**: 반드시 `--legacy-peer-deps` 사용 (`.npmrc`에 설정됨)
- **base64**: `TextEncoder`/`TextDecoder` 사용, `btoa`/`atob` 사용 금지
- **에러 메시지**: 한국어로 작성
- **`.obsidian/` 디렉토리**: 필터링 및 쓰기 차단 대상, 절대 수정하지 말 것
- **Obsidian 위키링크**: `[[note]]`, `![[image.png]]` 형태. `![[...]]`는 이미지 임베드로 GitHub raw URL로 변환

## Environments

- **Dev**: `https://obsidian-web-editor-git-develop-whqtkers-projects.vercel.app`
- **Prod**: `https://obsidian-for-web.vercel.app`
- 환경 변수는 Vercel Dashboard에서 환경별 관리 (`.env.example` 참고)
