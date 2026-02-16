# AGENTS.md — happy-server

> Fastify 백엔드 서버 — 세션 동기화, 인증, 실시간 통신

## Purpose

Happy Server는 모바일 앱과 CLI 간의 세션 동기화, 인증 관리, 실시간 통신을 담당하는 백엔드 서버이다. 모든 데이터는 클라이언트에서 암호화되어 저장되며, 서버는 zero-knowledge 모델로 운영된다.

## Technology Stack

- **Runtime**: Node.js 20
- **Framework**: Fastify 5 + Zod 타입 프로바이더
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Pub-Sub**: Redis (ioredis) + Redis Streams
- **Real-time**: Socket.io (Redis 어댑터)
- **File Storage**: MinIO (S3 호환)
- **Image Processing**: Sharp
- **Voice**: ElevenLabs API
- **Metrics**: Prometheus (prom-client)
- **Encryption**: TweetNaCl + privacy-kit
- **Testing**: Vitest

## Directory Structure

```
sources/
├── main.ts                       # 메인 엔트리포인트 (PostgreSQL + Redis)
├── standalone.ts                 # 스탠드얼론 엔트리 (PGlite, Redis 불필요)
├── context.ts                    # 요청 컨텍스트
├── types.ts                      # 글로벌 타입
├── versions.ts                   # API 버전 관리
│
├── app/                          # 애플리케이션 도메인
│   ├── api/                      # API 서버
│   │   ├── api.ts                # Fastify 서버 설정
│   │   ├── types.ts              # API 타입
│   │   ├── routes/               # REST 라우트
│   │   │   ├── authRoutes.ts     # POST /v1/auth/* — QR 인증
│   │   │   ├── sessionRoutes.ts  # /v1/sessions — 세션 CRUD
│   │   │   ├── v3SessionRoutes.ts # /v3/sessions — v3 프로토콜
│   │   │   ├── machinesRoutes.ts # /v1/machines — 머신 관리
│   │   │   ├── artifactsRoutes.ts# /v1/artifacts — 아티팩트 저장
│   │   │   ├── accessKeysRoutes.ts# /v1/access-keys — 접근 키
│   │   │   ├── accountRoutes.ts  # /v1/accounts — 계정 관리
│   │   │   ├── userRoutes.ts     # /v1/users — 사용자 정보
│   │   │   ├── feedRoutes.ts     # /v1/feed — 사용자 피드
│   │   │   ├── kvRoutes.ts       # /v1/kv — 키-값 저장소
│   │   │   ├── voiceRoutes.ts    # /v1/voice — 음성 대화
│   │   │   ├── pushRoutes.ts     # /v1/push — 푸시 알림
│   │   │   ├── connectRoutes.ts  # /v1/connect — 연결
│   │   │   ├── versionRoutes.ts  # /v1/version — 버전 정보
│   │   │   └── devRoutes.ts      # 개발자 전용 라우트
│   │   ├── socket/               # WebSocket 핸들러
│   │   │   ├── sessionUpdateHandler.ts  # 세션 업데이트
│   │   │   ├── machineUpdateHandler.ts  # 머신 업데이트
│   │   │   ├── artifactUpdateHandler.ts # 아티팩트 업데이트
│   │   │   ├── accessKeyHandler.ts      # 접근 키
│   │   │   ├── rpcHandler.ts            # RPC 프록시
│   │   │   ├── pingHandler.ts           # Ping/Pong
│   │   │   └── usageHandler.ts          # 사용량 보고
│   │   ├── socket.ts             # Socket.io 설정
│   │   └── utils/                # API 유틸리티
│   │
│   ├── auth/                     # 인증 도메인
│   │   └── auth.ts               # 토큰 검증, 인증 로직
│   ├── session/                  # 세션 도메인
│   │   └── sessionDelete.ts      # 세션 삭제
│   ├── social/                   # 소셜 네트워크
│   │   ├── friendAdd.ts          # 친구 추가
│   │   ├── friendRemove.ts       # 친구 삭제
│   │   ├── friendList.ts         # 친구 목록
│   │   ├── friendNotification.ts # 친구 알림
│   │   ├── relationshipGet.ts    # 관계 조회
│   │   ├── relationshipSet.ts    # 관계 설정
│   │   ├── usernameUpdate.ts     # 사용자명 변경
│   │   └── type.ts               # 소셜 타입
│   ├── events/                   # 이벤트 처리
│   ├── feed/                     # 피드 시스템
│   ├── github/                   # GitHub 통합 (OAuth)
│   ├── kv/                       # 키-값 저장소
│   ├── monitoring/               # Prometheus 메트릭
│   └── presence/                 # 온라인 상태 추적
│
├── modules/                      # 재사용 모듈
│   ├── encrypt.ts                # 암호화 유틸 (privacy-kit)
│   └── github.ts                 # GitHub API 래퍼
│
├── storage/                      # 데이터 저장소
│   ├── db.ts                     # Prisma 클라이언트
│   ├── inTx.ts                   # 트랜잭션 래퍼
│   ├── files.ts                  # S3 파일 저장
│   ├── redis.ts                  # Redis 클라이언트
│   ├── pgliteLoader.ts           # PGlite 임베디드 DB 로더
│   ├── processImage.ts           # 이미지 처리 (Sharp)
│   ├── uploadImage.ts            # 이미지 업로드
│   ├── thumbhash.ts              # ThumbHash 생성
│   ├── simpleCache.ts            # DB 기반 캐시
│   ├── repeatKey.ts              # 멱등성 키
│   ├── seq.ts                    # 시퀀스 관리
│   └── types.ts                  # 저장소 타입
│
├── utils/                        # 유틸리티
└── services/                     # 서비스 (pubsub 등)

prisma/
├── schema.prisma                 # 데이터베이스 스키마
└── migrations/                   # Prisma 마이그레이션
```

## Commands

```bash
# Development
yarn dev                          # 서버 시작 (포트 3005, .env.dev 로드)
yarn start                        # 서버 시작 (기본)
yarn standalone                   # PGlite 스탠드얼론 모드

# Database
yarn db                           # Docker PostgreSQL 시작
yarn redis                        # Docker Redis 시작
yarn s3                           # Docker MinIO 시작
yarn s3:init                      # MinIO 버킷 초기화
yarn migrate                      # Prisma 마이그레이션 실행
yarn generate                     # Prisma 클라이언트 생성

# Build / Test
yarn build                        # 타입체크 (tsc --noEmit)
yarn test                         # Vitest 실행
```

## Database Schema (Prisma)

### Core Entities

| Model | Purpose |
|-------|---------|
| `Account` | 사용자 계정 (publicKey 인증) |
| `Session` | Claude Code 세션 (암호화된 metadata/agentState) |
| `SessionMessage` | 세션 메시지 (암호화된 content) |
| `Machine` | 개발 머신 (암호화된 metadata/daemonState) |
| `Artifact` | 코드 아티팩트 (암호화된 header/body) |
| `AccessKey` | 세션-머신 접근 키 |

### Social
| Model | Purpose |
|-------|---------|
| `UserRelationship` | 친구 관계 (none/requested/pending/friend/rejected) |
| `UserFeedItem` | 사용자 피드 아이템 |

### Auth & Utility
| Model | Purpose |
|-------|---------|
| `TerminalAuthRequest` | QR 코드 인증 요청 |
| `AccountAuthRequest` | 계정 인증 요청 |
| `AccountPushToken` | 푸시 알림 토큰 |
| `ServiceAccountToken` | 서비스 토큰 (암호화) |
| `GithubUser` | GitHub 프로필 |
| `UserKVStore` | 키-값 저장소 |
| `UploadedFile` | 업로드 파일 메타 |
| `GlobalLock` | 분산 잠금 |
| `RepeatKey` | 멱등성 보장 |

## Architecture Patterns

### Request Flow
```
Client → Fastify Route → Zod Validation → Auth Decorator → Handler → Prisma → Response
```

### Real-time Updates
```
CLI/App → Socket.io → Handler → DB Update → EventBus → Redis → All Connections → Broadcast
```

### Optimistic Concurrency
- 모든 암호화 필드에 `version` 카운터
- 클라이언트가 `expectedVersion` 전송
- 버전 불일치 시 현재 상태 반환 (클라이언트 재시도)

### Transaction Pattern
```typescript
await inTx(ctx, async (ctx) => {
    // DB 작업
    afterTx(ctx, () => {
        // 트랜잭션 커밋 후 이벤트 발행
    });
});
```

### Action File Pattern
- 도메인 작업은 `app/{domain}/{entityAction}.ts`에 작성
  예: `social/friendAdd.ts`, `session/sessionDelete.ts`
- 엔티티명 접두사 + 동작으로 파일명 구성
- 각 파일에 로직 설명 문서 주석 포함
- 리턴값은 필수적인 것만 (just in case 반환 금지)

## Code Style

- **4 spaces** 인덴트
- 함수형/선언형 패턴 (클래스 지양)
- `@/` 절대 임포트만 사용
- interfaces > types, maps > enums
- `inTx`로 트랜잭션 래핑
- `afterTx`로 이벤트 발행 (트랜잭션 내 비트랜잭션 작업 금지)
- `privacy-kit`의 `privacyKit.encodeBase64/decodeBase64` 사용 (Buffer 금지)
- 마이그레이션은 직접 생성 금지 (human only)
- 로깅 추가는 요청 시에만
- 모든 연산은 멱등성 보장

## Deployment

### Docker
```bash
# Standalone (PGlite, Redis 불필요)
docker build -f Dockerfile -t happy-server .

# Production (PostgreSQL + Redis 필요)
docker build -f Dockerfile.server -t happy-server-prod .
```

### Environment Variables
```
DATABASE_URL              # PostgreSQL 연결
HANDY_MASTER_SECRET       # 마스터 시크릿
PORT                      # 서버 포트 (기본: 3005)
REDIS_URL                 # Redis (선택, standalone에선 불필요)
S3_HOST, S3_PORT          # MinIO/S3
S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET
ELEVENLABS_API_KEY        # 음성 API (선택)
```

## Debugging

### Log Files
- `.logs/` 디렉토리에 타임스탬프 파일 (MM-DD-HH-MM-SS.log)
- `DANGEROUSLY_LOG_TO_SERVER_FOR_AI_AUTO_DEBUGGING=true`로 원격 로깅

### Common Patterns
```bash
tail -100 .logs/*.log | grep -E "(error|Error|ERROR)"
tail -f .logs/*.log | grep "new-session"
tail -200 .logs/*.log | grep -E "(websocket|Socket.*connected)"
```
