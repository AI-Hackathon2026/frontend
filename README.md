# Frontend — 2026 AI 경진대회

React + Vite SPA for the competition backend API.

## Features

### Auth
- 회원가입 / 로그인 / 로그아웃
- 세션 갱신 (쿠키 + CSRF)
- 이메일 중복 확인 (`POST /auth/check-email`)

### AI 챗봇 탭
- 대화 생성·목록·제목 수정·삭제
- AI 메시지 전송 (`POST /chatbot`)
- 메시지 수정·삭제
- AI 모델 조회 및 변경

### KNHANES 건강통계 탭
- 파일 목록 (`GET /knhanes/files`)
- 지표 조회 (`POST /knhanes/query`)
- 건강 루틴 그라운딩 (`POST /knhanes/ground`)

## Run

1. Backend on port **4000** (project root):

   ```bash
   npm run dev
   ```

2. Frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open http://localhost:3000

Vite proxies `/auth`, `/chat`, `/chatbot`, `/knhanes`, `/users` to the backend with cookie credentials.

## Build

```bash
cd frontend
npm run build
```

Set `VITE_API_URL` for production if the API is on a different origin.
