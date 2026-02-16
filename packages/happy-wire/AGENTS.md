# AGENTS.md — happy-wire

> 공유 wire 타입 및 Zod 스키마 패키지 (`@slopus/happy-wire`)

## Purpose

`happy-wire`는 Happy 생태계의 모든 클라이언트(app, cli, agent)와 서버가 공유하는 메시지 타입, 프로토콜 스키마, Zod 검증 스키마를 정의한다. 패키지 경계를 넘는 데이터 계약의 단일 진실 원천(single source of truth)이다.

## Structure

```
src/
├── index.ts                  # 공개 API 엔트리포인트
├── messages.ts               # 메시지 타입 및 Zod 스키마
├── messageMeta.ts            # 메시지 메타데이터 타입
├── sessionProtocol.ts        # 세션 프로토콜 타입 (v3)
└── legacyProtocol.ts         # 레거시 프로토콜 호환성
```

## Key Exports

- **메시지 타입**: 세션 메시지, 업데이트, RPC 정의
- **세션 프로토콜**: v3 세션 프로토콜 스키마
- **Zod 스키마**: 런타임 검증용 스키마 (서버 및 클라이언트 공용)

## Commands

```bash
yarn workspace @slopus/happy-wire build       # 빌드 (pkgroll)
yarn workspace @slopus/happy-wire typecheck   # 타입체크
yarn workspace @slopus/happy-wire test        # 테스트 (Vitest)
```

## Dependencies

- `zod` — 런타임 스키마 검증
- `@paralleldrive/cuid2` — ID 생성

## Important Notes

- wire 타입 변경은 모든 소비자 패키지(happy-app, happy-cli, happy-agent, happy-server)에 영향
- 변경 시 반드시 모든 소비자의 타입체크 확인 필요
- npm에 `@slopus/happy-wire`로 퍼블리시됨
- 빌드 출력은 CJS + ESM 듀얼 포맷
