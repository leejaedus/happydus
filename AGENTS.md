# AGENTS.md — Happy Coder Monorepo

> Mobile and Web Client for Claude Code & Codex with end-to-end encryption.

## Project Overview

Happy Coder는 Claude Code와 Codex를 모바일/웹에서 원격 제어할 수 있게 해주는 오픈소스 프로젝트이다. 사용자는 `happy` CLI를 통해 코딩 에이전트를 시작하고, 모바일 앱에서 실시간으로 모니터링 및 제어할 수 있다. 모든 통신은 TweetNaCl/libsodium 기반 end-to-end 암호화로 보호된다.

## Monorepo Structure

```
happydus/                        # Yarn 1 workspaces monorepo
├── packages/
│   ├── happy-app/               # React Native + Expo 모바일/웹 클라이언트
│   ├── happy-cli/               # CLI 래퍼 (npm: happy-coder)
│   ├── happy-agent/             # 원격 에이전트 제어 CLI (npm: @slopus/agent)
│   ├── happy-server/            # Fastify 백엔드 서버
│   └── happy-wire/              # 공유 wire 타입 및 Zod 스키마 (npm: @slopus/happy-wire)
├── docs/                        # 아키텍처 및 프로토콜 문서
├── scripts/                     # 릴리스, postinstall 스크립트
├── Dockerfile                   # Standalone 서버 (PGlite)
├── Dockerfile.server            # 프로덕션 서버
└── Dockerfile.webapp            # 웹앱 빌드
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Mobile/Web | React Native 0.81, Expo SDK 54, TypeScript, Unistyles v3 |
| Desktop | Tauri v2 (macOS) |
| CLI | Node.js, TypeScript, Ink (React CLI), `@anthropic-ai/claude-code` SDK |
| Server | Fastify 5, PostgreSQL + Prisma, Redis, Socket.io |
| Encryption | TweetNaCl (CLI/server), libsodium (app), privacy-kit |
| Validation | Zod (전 패키지 공유) |
| Build | pkgroll (CLI/agent/wire), Expo EAS (app) |
| Testing | Vitest (전 패키지) |
| Package Manager | Yarn 1.22 |

## Key Commands

```bash
# Development
yarn cli                    # CLI 개발 실행 (tsx)
yarn web                    # 웹앱 개발 서버

# Per-package
yarn workspace happy-app start          # Expo 개발 서버
yarn workspace happy-server dev         # 서버 개발 모드
yarn workspace happy-coder dev          # CLI 개발 모드

# Build & Test
yarn workspace happy-coder build        # CLI 빌드 (pkgroll)
yarn workspace happy-server build       # 서버 타입체크
yarn workspace happy-app typecheck      # 앱 타입체크
yarn workspace <pkg> test               # Vitest 실행

# Release
yarn release                # 전체 릴리스 스크립트
```

## Architecture Flow

```
┌─────────────┐     WebSocket/REST      ┌──────────────┐     WebSocket/REST     ┌─────────────┐
│  happy-app  │ ◄──────────────────────► │ happy-server │ ◄────────────────────► │  happy-cli  │
│ (Mobile/Web)│    Socket.io + E2EE      │  (Fastify)   │    Socket.io + E2EE    │  (Daemon)   │
└─────────────┘                          └──────────────┘                        └─────────────┘
                                               │                                       │
                                          PostgreSQL                            Claude Code SDK
                                          Redis                                 Codex Runtime
                                          S3 (MinIO)                            node-pty
```

### Data Flow

1. **인증**: QR 코드 기반 challenge-response (TweetNaCl 서명)
2. **세션 생성**: CLI가 암호화된 세션을 서버에 생성 → 앱에 실시간 동기화
3. **메시지 흐름**:
   - 로컬 모드: 사용자 입력 → PTY → Claude → 파일 감시 → 서버
   - 원격 모드: 모바일 앱 → 서버 → Claude SDK → 서버 → 모바일 앱
4. **데몬**: 백그라운드 프로세스로 세션 관리, 자동 업데이트, 원격 제어 수신

## Cross-Cutting Concerns

### Encryption
- 모든 민감 데이터는 TweetNaCl/libsodium으로 E2E 암호화
- 서버는 암호화된 데이터만 저장 (zero-knowledge)
- `happy-wire`에 공유 암호화 타입 정의

### Shared Types (happy-wire)
- 세션 프로토콜, 메시지 타입, Zod 스키마를 모든 패키지에서 공유
- wire 타입 변경 시 모든 소비자 패키지에 영향

### Real-time Sync
- Socket.io 기반 양방향 실시간 통신
- 낙관적 동시성 제어 (version 기반)
- Redis Streams를 통한 서버 간 이벤트 전파

## Development Conventions

- **4 spaces** 인덴트 (전 패키지)
- **TypeScript strict mode** 활성화
- `@/` 경로 별칭으로 내부 임포트
- 모든 임포트는 파일 상단에 위치
- Yarn (npm 사용 금지)
- 클래스 사용 최소화, 함수형/선언형 패턴 선호
- 테스트에서 모킹 사용 금지 — 실제 의존성 사용

## CI/CD

- `.github/workflows/typecheck.yml` — 전 패키지 타입체크
- `.github/workflows/cli-smoke-test.yml` — CLI 스모크 테스트
- EAS (Expo Application Services) — 모바일 빌드/배포
- Docker 멀티스테이지 빌드 — 서버 배포

## Documentation

`docs/` 디렉토리에 상세 문서:
- `protocol.md` — 통신 프로토콜
- `encryption.md` — 암호화 아키텍처
- `session-protocol.md` — 세션 프로토콜
- `backend-architecture.md` — 서버 아키텍처
- `cli-architecture.md` — CLI 아키텍처
- `deployment.md` — 배포 가이드
- `api.md` — REST API 명세
