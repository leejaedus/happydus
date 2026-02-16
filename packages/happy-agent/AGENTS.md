# AGENTS.md — happy-agent

> 원격 에이전트 제어 CLI (`@slopus/agent`)

## Purpose

`happy-agent`는 Happy 세션을 프로그래밍 방식으로 원격 제어할 수 있는 CLI 도구이다. 세션 생성, 메시지 전송, 모니터링을 명령줄에서 수행할 수 있다. 자동화 및 CI/CD 통합에 적합하다.

## Structure

```
src/
├── index.ts                  # CLI 엔트리포인트 (Commander.js)
├── api.ts                    # 서버 API 클라이언트
├── auth.ts                   # 인증 (TweetNaCl 서명)
├── config.ts                 # 설정 관리
├── credentials.ts            # 자격 증명 관리
├── encryption.ts             # E2E 암호화 유틸리티
├── session.ts                # 세션 관리 로직
├── output.ts                 # 출력 포매팅
└── acceptance.test.ts        # 통합 수락 테스트
```

## Commands

```bash
yarn workspace @slopus/agent dev          # 개발 실행 (tsx)
yarn workspace @slopus/agent build        # 빌드 (pkgroll)
yarn workspace @slopus/agent test         # 테스트 (빌드 후 vitest)
yarn workspace @slopus/agent typecheck    # 타입체크
```

## Key Dependencies

- `@slopus/happy-wire` — 공유 wire 타입
- `commander` — CLI 프레임워크
- `socket.io-client` — 실시간 WebSocket 통신
- `tweetnacl` — E2E 암호화
- `axios` — HTTP 클라이언트
- `chalk` — 터미널 색상 출력
- `qrcode-terminal` — QR 코드 인증

## Important Notes

- npm에 `@slopus/agent`로 퍼블리시됨
- 빌드 출력은 CJS + ESM 듀얼 포맷
- 테스트는 실제 API 호출 수행 (모킹 없음)
- `bin/happy-agent.mjs`가 CLI 바이너리 엔트리포인트
