# AGENTS.md — happy-cli

> Claude Code & Codex CLI 래퍼 + 데몬 (npm: `happy-coder`)

## Purpose

Happy CLI는 Claude Code와 Codex를 래핑하여 모바일 원격 제어, 세션 동기화, 데몬 백그라운드 관리를 제공하는 CLI 도구이다. `happy` 명령으로 `claude`를 대체하고, `happy codex`로 `codex`를 대체한다.

## Technology Stack

- **Language**: TypeScript (strict mode)
- **CLI UI**: Ink (React for CLI) + chalk
- **Claude**: `@anthropic-ai/claude-code` SDK
- **Codex**: 자체 통합
- **MCP**: Model Context Protocol SDK
- **ACP**: Agent Client Protocol SDK
- **Real-time**: Socket.io client + Fastify (데몬 HTTP 서버)
- **Encryption**: TweetNaCl
- **Build**: pkgroll (CJS + ESM 듀얼 출력)
- **Testing**: Vitest (모킹 없이 실제 API 호출)

## Directory Structure

```
src/
├── index.ts                      # CLI 엔트리포인트 (인자 파싱)
├── lib.ts                        # 라이브러리 엔트리
├── persistence.ts                # 로컬 설정/키 저장
├── configuration.ts              # 컴파일 타임 설정
├── projectPath.ts                # 프로젝트 경로 해석
│
├── api/                          # 서버 통신 계층
│   ├── api.ts                    # REST API 클라이언트
│   ├── apiSession.ts             # WebSocket 세션 클라이언트
│   ├── apiMachine.ts             # 머신 관리 WebSocket 클라이언트
│   ├── auth.ts                   # 인증 (TweetNaCl 서명)
│   ├── encryption.ts             # E2E 암호화 유틸
│   ├── pushNotifications.ts      # 푸시 알림 트리거
│   ├── webAuth.ts                # 웹 인증
│   ├── rpc/                      # RPC 핸들러
│   └── types.ts                  # Zod API 스키마
│
├── claude/                       # Claude Code 통합
│   ├── loop.ts                   # 메인 제어 루프 (interactive ↔ remote)
│   ├── session.ts                # 세션 관리
│   ├── runClaude.ts              # Claude 실행 오케스트레이션
│   ├── claudeLocal.ts            # 로컬 모드 (PTY)
│   ├── claudeLocalLauncher.ts    # 로컬 모드 런처
│   ├── claudeRemote.ts           # 원격 모드 (SDK)
│   ├── claudeRemoteLauncher.ts   # 원격 모드 런처
│   ├── registerKillSessionHandler.ts # 세션 종료 핸들러
│   ├── sdk/                      # Claude SDK 직접 통합
│   ├── utils/                    # Claude 유틸리티
│   └── types.ts                  # Claude 메시지 타입
│
├── codex/                        # Codex 통합
│   ├── runCodex.ts               # Codex 실행
│   ├── codexMcpClient.ts         # MCP 클라이언트
│   ├── happyMcpStdioBridge.ts    # MCP stdio 브릿지
│   ├── executionPolicy.ts        # 실행 정책
│   ├── types.ts                  # Codex 타입
│   └── utils/                    # Codex 유틸리티
│
├── gemini/                       # Gemini 통합
│
├── agent/                        # 범용 에이전트 제어
│   ├── acp/                      # Agent Control Protocol
│   ├── adapters/                 # 프로토콜 어댑터
│   ├── core/                     # 핵심 에이전트 로직
│   ├── factories/                # 에이전트 팩토리
│   └── transport/                # 전송 계층
│
├── daemon/                       # 데몬 (백그라운드 프로세스)
│   ├── run.ts                    # 데몬 메인 실행
│   ├── controlServer.ts          # HTTP 제어 서버 (127.0.0.1)
│   ├── controlClient.ts          # 데몬 HTTP 클라이언트
│   ├── doctor.ts                 # 프로세스 진단/정리
│   ├── install.ts                # 데몬 설치
│   ├── uninstall.ts              # 데몬 제거
│   ├── types.ts                  # 데몬 타입
│   └── mac/                      # macOS 전용 (launchd)
│
├── sessionProtocol/              # v3 세션 프로토콜
│
├── sandbox/                      # 샌드박스 실행 환경
│
├── commands/                     # CLI 명령어
│   ├── auth.ts                   # 인증 명령
│   ├── connect/                  # 연결 명령
│   └── sandbox.ts                # 샌드박스 명령
│
├── modules/                      # 도구/유틸 모듈
│   ├── common/                   # 공통 도구
│   ├── ripgrep/                  # ripgrep 바이너리
│   ├── difftastic/               # difftastic 바이너리
│   ├── watcher/                  # 파일 시스템 감시
│   └── proxy/                    # HTTP 프록시
│
├── parsers/                      # 메시지/출력 파서
│
├── ui/                           # 사용자 인터페이스
│   ├── start.ts                  # 시작 화면
│   ├── logger.ts                 # 파일 기반 로깅
│   ├── qrcode.ts                 # QR 코드 생성
│   └── ink/                      # Ink React 컴포넌트
│
└── utils/                        # 유틸리티
    └── time.ts                   # 지수 백오프 등
```

## Commands

```bash
# Development
yarn cli                          # tsx로 직접 실행
yarn dev                          # 개발 모드
yarn dev:local-server             # 로컬 서버 환경

# Build
yarn build                        # pkgroll 빌드 (tsc + pkgroll)
yarn typecheck                    # 타입체크만

# Test
yarn test                         # 빌드 후 vitest

# Production binary
yarn start                        # 빌드 후 bin/happy.mjs 실행
```

## Architecture

### Dual Mode Operation
1. **Interactive (Local)**: PTY 기반 터미널 세션 → Claude 실행 → 파일 감시로 동기화
2. **Remote**: SDK 기반 원격 세션 → 모바일 앱이 입력 전송 → 결과 스트리밍

### Control Loop (`claude/loop.ts`)
- Interactive ↔ Remote 모드 전환 관리
- 키보드 입력으로 로컬 제어 복귀
- 세션 영속성 및 재개

### Daemon (`daemon/`)
- 백그라운드 프로세스로 세션 관리
- HTTP 제어 서버 (127.0.0.1 전용)
- WebSocket으로 서버와 실시간 연결
- 버전 불일치 자동 업데이트
- macOS launchd 통합

### Data Flow
```
Interactive: User → PTY → Claude → File Watcher → Server
Remote:      Mobile App → Server → Claude SDK → Server → Mobile App
```

## Code Style

- **Strict typing**: 모든 코드에 타입 필수
- 클래스 사용 최소화
- JSDoc 헤더 주석으로 파일 책임 설명
- `@/` 별칭으로 src 임포트
- 모든 import는 파일 상단에 (중간 import 금지)
- 작은 getter/setter 함수 생성 금지
- 과도한 if 문 지양 — 더 나은 설계로 제어 흐름 변경 최소화
- 파일 로그로 디버깅 (콘솔 출력은 사용자 메시지만)

## Key Files

| File | Role |
|------|------|
| `src/index.ts` | CLI 엔트리포인트 |
| `src/claude/loop.ts` | 핵심 제어 루프 |
| `src/claude/claudeLocal.ts` | 로컬 모드 (PTY) |
| `src/claude/claudeRemote.ts` | 원격 모드 (SDK) |
| `src/daemon/run.ts` | 데몬 메인 |
| `src/daemon/controlServer.ts` | 데몬 HTTP 서버 |
| `src/api/api.ts` | REST API 클라이언트 |
| `src/api/apiSession.ts` | WebSocket 세션 |
| `src/api/encryption.ts` | E2E 암호화 |
| `src/persistence.ts` | 로컬 설정 저장 |

## Daemon Lifecycle

1. `happy daemon start` → 분리 프로세스 스폰
2. 버전 확인 → 잠금 획득 → 인증
3. HTTP 서버 시작 + WebSocket 연결
4. 하트비트 루프 (60초) — 버전/세션 모니터링
5. 종료: HTTP `/stop`, RPC `requestShutdown`, OS 시그널

## Security

- 개인키: `~/.handy/access.key` (제한된 권한)
- TweetNaCl로 모든 통신 암호화
- challenge-response 인증 (리플레이 공격 방지)
- 세션 격리 (고유 세션 ID)

## Subdirectory AGENTS.md

- `src/daemon/CLAUDE.md` — 데몬 제어 흐름 및 라이프사이클 상세 문서
