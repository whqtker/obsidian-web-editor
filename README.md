# Obsidian Web Editor

- GitHub에 저장된 Obsidian vault를 브라우저에서 편집할 수 있는 웹 에디터

- GitHub API를 직접 호출하여 마크다운 편집, 실시간 프리뷰, 위키링크, 이미지 업로드 등을 지원한다.

[![Deploy](https://img.shields.io/badge/demo-obsidian--for--web.vercel.app-black?logo=vercel)](https://obsidian-for-web.vercel.app)

![React](https://img.shields.io/badge/React_18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?logo=react&logoColor=white)
![CodeMirror](https://img.shields.io/badge/CodeMirror_6-D30707?logo=codemirror&logoColor=white)

## 시작하기

1. [obsidian-for-web.vercel.app](https://obsidian-for-web.vercel.app)에 접속
2. GitHub 계정으로 로그인
3. Obsidian vault가 저장된 레포지토리와 브랜치를 선택
4. 파일 트리에서 파일을 열어 편집 시작

## 개발

```bash
npm install --legacy-peer-deps
npm run build
npm run test:run
npm run lint
```

- 환경 변수는 `.env.example`을 참고하여 Vercel Dashboard에서 설정한다.

## 배포

- Vercel에서 자동 배포

- `develop` 브랜치 → Preview 환경
- `main` 브랜치 → Production 환경
