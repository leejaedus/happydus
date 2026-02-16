# AGENTS.md — happy-app

> React Native + Expo 모바일/웹/데스크톱 클라이언트

## Purpose

Happy App은 Claude Code와 Codex 세션을 모바일(iOS/Android), 웹, macOS 데스크톱에서 실시간으로 모니터링하고 제어하는 클라이언트 앱이다. E2E 암호화된 WebSocket 통신으로 세션 상태를 동기화한다.

## Technology Stack

- **Framework**: Expo SDK 54, React Native 0.81.4, React 19.1
- **Desktop**: Tauri v2 (macOS)
- **Navigation**: Expo Router v6 (파일 기반 라우팅)
- **Styling**: Unistyles v3 (테마, 브레이크포인트, 미디어 쿼리)
- **State**: React Context + Zustand + 커스텀 리듀서
- **Real-time**: Socket.io
- **Encryption**: libsodium (react-native-libsodium)
- **Voice**: LiveKit + ElevenLabs
- **i18n**: 9개 언어 (en, ru, pl, es, ca, it, pt, ja, zh-Hans)
- **Testing**: Vitest

## Directory Structure

```
sources/
├── app/                          # Expo Router 화면
│   ├── _layout.tsx               # 루트 레이아웃
│   ├── +html.tsx                 # 웹 HTML 템플릿
│   └── (app)/                    # 인증된 사용자 영역
│       ├── _layout.tsx           # 앱 레이아웃 (사이드바/탭)
│       ├── index.tsx             # 홈 화면
│       ├── session/              # 세션 상세 화면
│       ├── settings/             # 설정 화면들
│       ├── new/                  # 새 세션 생성
│       ├── friends/              # 소셜 (친구)
│       ├── inbox/                # 알림 인박스
│       ├── artifacts/            # 코드 아티팩트
│       ├── machine/              # 머신 관리
│       ├── user/                 # 사용자 프로필
│       ├── terminal/             # 터미널 뷰
│       ├── restore/              # 세션 복원
│       ├── dev/                  # 개발자 페이지
│       ├── server.tsx            # 서버 설정
│       ├── changelog.tsx         # 변경 로그
│       └── text-selection.tsx    # 텍스트 선택
├── auth/                         # 인증
│   └── AuthContext.tsx           # Auth 상태 (QR 기반)
├── components/                   # UI 컴포넌트
│   ├── Item.tsx                  # 기본 리스트 아이템
│   ├── ItemList.tsx              # 리스트 컨테이너
│   ├── ItemGroup.tsx             # 그룹 컨테이너
│   ├── Header.tsx                # 커스텀 내비게이션 헤더
│   ├── Avatar.tsx                # 아바타 (항상 사용)
│   ├── markdown/                 # 마크다운 렌더러
│   ├── diff/                     # 코드 diff 뷰
│   ├── CommandPalette/           # 커맨드 팔레트
│   ├── autocomplete/             # 자동완성
│   ├── tools/                    # 도구 UI
│   ├── navigation/               # 내비게이션 헬퍼
│   ├── web/                      # 웹 전용 컴포넌트
│   └── layout.ts                 # 레이아웃 너비 제약
├── sync/                         # 실시간 동기화 엔진
│   ├── sync.ts                   # 핵심 Sync 클래스
│   ├── apiSocket.ts              # Socket.io 클라이언트
│   ├── apiTypes.ts               # API 타입
│   ├── reducer/                  # 동기화 상태 리듀서
│   ├── encryption/               # 암호화 로직
│   ├── git-parsers/              # Git 상태 파싱
│   ├── prompt/                   # 프롬프트 렌더링
│   ├── storage.ts                # 영속 저장소
│   ├── persistence.ts            # 세션 영속성
│   ├── settings.ts               # 설정 관리
│   └── revenueCat/               # 구독 관리
├── encryption/                   # E2E 암호화 모듈
├── realtime/                     # LiveKit 실시간 통신
├── modal/                        # 모달 시스템 (Alert 대체)
├── text/                         # i18n 번역
│   ├── index.ts                  # t() 함수 엔트리
│   ├── _all.ts                   # 언어 메타데이터
│   └── translations/             # 9개 언어 파일
├── hooks/                        # 커스텀 React 훅
│   ├── useHappyAction.ts         # 비동기 액션 (에러 자동 처리)
│   ├── useGlobalKeyboard.ts      # 웹 키보드 단축키
│   ├── useSearch.ts              # 검색
│   └── ...                       # 기타 훅
├── config.ts                     # 앱 설정
├── constants/                    # 상수
├── assets/                       # 이미지, 폰트, 애니메이션
├── track/                        # PostHog 분석
├── utils/                        # 유틸리티
└── scripts/                      # 빌드 스크립트
```

## Commands

```bash
# Development
yarn start                        # Expo 개발 서버
yarn ios                          # iOS 시뮬레이터
yarn android                      # Android 에뮬레이터
yarn web                          # 웹 브라우저
yarn tauri:dev                    # macOS 데스크톱

# Quality
yarn typecheck                    # TypeScript 체크 (변경 후 필수!)
yarn test                         # Vitest

# Build / Deploy
yarn prebuild                     # 네이티브 디렉토리 생성
yarn ota                          # OTA 업데이트 (preview)
yarn ota:production               # OTA 업데이트 (production)
yarn release:build:appstore       # App Store 빌드
```

## Architecture Patterns

### Sync Engine
- `sync.ts` 클래스가 모든 메인 데이터 동기화 담당
- `invalidate sync` 패턴으로 데이터 갱신
- 로딩 에러 표시 금지 — 항상 재시도

### State Management
- `AuthContext.tsx` — 인증 상태 (React Context)
- `sync/reducer/` — 동기화 상태 (커스텀 리듀서)
- Zustand — 로컬 UI 상태

### Navigation
- Expo Router v6 API만 사용 (react-navigation API 금지)
- 화면 옵션은 `_layout.tsx`에서 설정 (개별 페이지 아님)
- 커스텀 헤더는 `NavigationHeader` 사용
- 모든 화면에 헤더 표시

### Styling (Unistyles v3)
- `StyleSheet.create`는 react-native-unistyles에서 임포트
- 테마 접근: `(theme, runtime) => ({...})`
- 변형(variants), 미디어 쿼리, 브레이크포인트 지원
- expo-image에는 unistyles 사용 금지 — 인라인 스타일
- 스타일은 파일 최하단에 배치

### Components
- `Item` 컴포넌트를 우선 사용
- `ItemList`로 대부분의 리스트 UI 구성
- `Avatar` 컴포넌트를 아바타에 항상 사용
- `Modal.alert()`로 Alert 대체 (React Native Alert 금지)
- `useHappyAction` 훅으로 비동기 작업 처리 (에러 자동 처리)
- `AsyncLock` 클래스로 배타적 비동기 잠금
- 페이지는 `memo`로 감싸기

### i18n
- 모든 사용자 표시 문자열에 `t('key')` 사용 (하드코딩 금지)
- 새 문자열 추가 시 모든 9개 언어 파일에 추가 필수
- `common` 섹션의 기존 키 먼저 확인
- 개발 페이지는 i18n 예외

## Key Files

| File | Role |
|------|------|
| `sources/app/_layout.tsx` | 루트 내비게이션 구조 |
| `sources/auth/AuthContext.tsx` | 인증 상태 |
| `sources/sync/sync.ts` | 핵심 동기화 엔진 |
| `sources/sync/apiSocket.ts` | WebSocket 통신 |
| `sources/sync/reducer/` | 상태 리듀서 |
| `sources/components/Item.tsx` | 기본 UI 블록 |
| `sources/text/index.ts` | i18n 엔트리 |
| `sources/config.ts` | 앱 설정 |

## Important Rules

- 웹은 2차 플랫폼 — 웹 전용 구현은 명시 요청 시에만
- 후방 호환성 불필요 — 명시 요청 없으면 제거 가능
- 비사소한 훅은 `hooks/` 폴더에 별도 파일로, 로직 설명 주석 포함
- 웹 핫키는 `useGlobalKeyboard` 사용 (변경 금지)
- `@sources/app/(app)/`에 앱 페이지 저장
- `_layout.tsx`에서 화면 파라미터 설정 (레이아웃 시프트 방지)
