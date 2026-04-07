# theRankers - 한국판 TipRanks

## 프로젝트 개요
국내 증권사 애널리스트의 투자의견과 목표가를 추적하고, 실제 주가 성과와 비교하여 애널리스트별 정확도를 랭킹화하는 서비스.

## 핵심 가치
- 애널리스트 리포트의 "매수 편향"을 데이터로 검증
- 목표가 달성률, 초과수익률 기반 100% 정량 평가
- 개인 투자자에게 신뢰할 수 있는 애널리스트 판별 근거 제공

## 기술 스택
- **Backend**: Python 3.12 / FastAPI 0.115
- **Database**: PostgreSQL 16 (영구 데이터) + Redis 7 (캐시/실시간)
- **ORM**: SQLAlchemy 2.0 (async) + Alembic (마이그레이션)
- **Auth**: JWT (PyJWT + passlib/bcrypt)
- **Data Collection**: httpx / BeautifulSoup / lxml (리포트 수집)
- **Data Analysis**: Pandas / NumPy (성과 분석)
- **Stock Price API**: pykrx (국내 주가 데이터)
- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **UI 스타일**: Apple 미니멀 디자인 (보라색 그라데이션 금지)
- **Container**: Docker Compose (6개 서비스)
- **Task Queue**: Celery + Redis (비동기 수집/분석 작업)
- **E2E 테스트**: Playwright (chromium headless)

## 프로젝트 구조
```
theRankers/
├── .claude/                    # Claude Code 설정
│   ├── settings.local.json    # 로컬 도구 권한 (gitignore)
│   ├── skills/                # Sub-agent 정의 (15개)
│   │   ├── dev/               # 오케스트레이터
│   │   ├── planner/           # 설계자
│   │   ├── researcher/        # 조사원
│   │   ├── data-architect/    # 데이터 아키텍트
│   │   ├── ui-designer/       # UI/UX 디자이너
│   │   ├── frontend/          # 프론트엔드 개발자
│   │   ├── reviewer/          # 코드 리뷰어
│   │   ├── ux-reviewer/       # UX 리뷰어
│   │   ├── tester/            # QA 엔지니어 (Playwright)
│   │   ├── debugger/          # 디버거
│   │   ├── documenter/        # 문서화 담당
│   │   ├── docker-up/         # Docker 시작
│   │   ├── docker-down/       # Docker 중지
│   │   └── docker-status/     # Docker 상태
│   └── test-registry.md       # Playwright 시험 항목 레지스트리
├── backend/                    # FastAPI 애플리케이션
│   ├── app/
│   │   ├── main.py            # FastAPI 앱 엔트리포인트
│   │   ├── config.py          # 환경 설정 (pydantic-settings)
│   │   ├── database.py        # AsyncSession + Base
│   │   ├── models/            # SQLAlchemy 모델 (9개)
│   │   │   ├── user.py        # 사용자 (UUID PK)
│   │   │   ├── analyst.py     # 애널리스트
│   │   │   ├── report.py      # 리포트 (투자의견, 목표가, 추적 가격)
│   │   │   ├── stock.py       # 종목 (GICS 섹터)
│   │   │   ├── price.py       # 주가 (수정주가 포함)
│   │   │   ├── ranking.py     # 랭킹 스냅샷 (점수 분해 포함)
│   │   │   └── board.py       # Board, Post, Comment
│   │   ├── schemas/           # Pydantic 스키마 (7개)
│   │   ├── api/               # API 라우터 (6개)
│   │   │   ├── auth.py        # 회원가입/로그인/토큰갱신/내정보
│   │   │   ├── analysts.py    # 애널리스트 목록/상세
│   │   │   ├── reports.py     # 리포트 목록/상세 (필터링)
│   │   │   ├── stocks.py      # 종목 목록/상세/컨센서스
│   │   │   ├── rankings.py    # 랭킹 (기간별)
│   │   │   └── boards.py      # 게시판/게시글/댓글 CRUD
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── auth/          # 인증 서비스 + 의존성
│   │   │   ├── collector/     # 데이터 수집 (미구현)
│   │   │   ├── analysis/      # 성과 분석 (미구현)
│   │   │   └── market/        # 시장 데이터 (미구현)
│   │   └── tasks/             # Celery 비동기 작업
│   │       ├── __init__.py    # Celery 앱 설정
│   │       ├── collect.py     # 수집 태스크 (미구현)
│   │       ├── analyze.py     # 분석 태스크 (미구현)
│   │       └── schedule.py    # 스케줄링 (미구현)
│   ├── migrations/            # Alembic 마이그레이션
│   │   ├── env.py             # async 마이그레이션 설정
│   │   └── versions/          # 마이그레이션 파일
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js 14 프론트엔드
│   ├── src/
│   │   ├── app/               # App Router 페이지 (10개)
│   │   │   ├── page.tsx       # 메인 대시보드
│   │   │   ├── rankings/      # 랭킹 페이지
│   │   │   ├── analysts/      # 애널리스트 목록 + [id] 상세
│   │   │   ├── stocks/        # 종목 목록 + [code] 상세
│   │   │   ├── reports/       # 리포트 검색
│   │   │   ├── boards/        # 커뮤니티 게시판 [slug]
│   │   │   └── auth/          # 로그인 + 회원가입
│   │   ├── components/
│   │   │   ├── layout/        # Header, Footer
│   │   │   └── ui/            # AnalystAvatar, ScoreBadge, OpinionBadge, PeriodSelector
│   │   ├── lib/               # api.ts, utils.ts, store.ts (zustand)
│   │   ├── types/             # TypeScript 타입 정의
│   │   └── styles/            # globals.css (Tailwind)
│   ├── tailwind.config.ts     # Apple 스타일 디자인 토큰
│   ├── package.json
│   └── Dockerfile
├── e2e/                        # Playwright E2E 테스트
│   ├── playwright.config.ts
│   └── tests/                 # 테스트 파일 (4개, 45건)
│       ├── 01-backend-health.spec.ts
│       ├── 02-auth-api.spec.ts
│       ├── 03-frontend-pages.spec.ts
│       └── 04-frontend-interaction.spec.ts
├── docker-compose.yml          # 6개 서비스 정의
├── .env                        # 환경 변수 (gitignore)
├── .gitignore
├── CLAUDE.md                   # AI 개발 가이드 (이 파일)
├── README.md                   # 프로젝트 소개 및 실행 가이드
└── project-context.md          # 장기 비전
```

## 핵심 도메인 모델 (9개)

### User (사용자)
- id (UUID), email, username, hashed_password, display_name
- is_active, is_admin

### Analyst (애널리스트)
- id, name, firm (증권사), sector (담당 섹터), image_url
- 집계 지표: accuracy_rate, avg_return, total_reports, ranking_score

### Report (리포트)
- id, analyst_id, stock_id
- opinion (매수/중립/매도), target_price, previous_target_price, report_date
- 추적 가격: price_at_report, price_1m, price_3m, price_6m, price_12m
- target_achieved, achieved_date
- 초과수익률: excess_return_1m, 3m, 6m, 12m
- 복합 유니크: (analyst_id, stock_id, report_date)

### Stock (종목)
- id, code (종목코드), name, market (KOSPI/KOSDAQ)
- gics_sector, gics_sector_code (GICS 11개 섹터)

### Price (주가)
- id, stock_id, date
- open_price, high_price, low_price, close_price, volume, adjusted_close (수정주가)
- 복합 유니크: (stock_id, date)

### Ranking (랭킹 스냅샷)
- id, analyst_id, period (1m/3m/6m/12m), rank, score
- 점수 분해: target_hit_score, excess_return_score, direction_accuracy_score, consistency_score
- calculated_at

### Board, Post, Comment (커뮤니티)
- Board: slug, name, board_type (stock/analyst/firm/general), reference_id
- Post: board_id, author_id, title, content, view_count, like_count
- Comment: post_id, author_id, parent_id (대댓글), content, like_count

## 스코어링 로직 (100% 정량, 확정)

| 항목 | 가중치 | 계산 방법 |
|------|--------|----------|
| 목표가 달성률 | **35%** | 12개월 내 목표가 도달 비율 |
| 투자의견 초과수익률 | **30%** | 의견수익률 - GICS 섹터지수 수익률 (FnGuide 방법론) |
| 수익률 방향 정확도 | **20%** | 매수→양수, 매도→음수, 중립→\|수익률\|<5% 일치율 |
| 일관성 | **15%** | 1/(1+σ) 정규화, 상대평가 |

### 보정 규칙
- 최소 리포트 수: 해당 기간 내 3건 이상
- 시간 가중: 최근 리포트 높은 가중치 (반감기 6개월)
- 섹터 조정: GICS 섹터 지수 대비 초과수익률
- 기간 선택: 1m / 3m / 6m / 12m 롤링

## 섹터 분류: GICS 11개 (KRX 공식)

| 코드 | 섹터 |
|------|------|
| 10 | 에너지 |
| 15 | 소재 |
| 20 | 산업재 |
| 25 | 경기소비재 |
| 30 | 필수소비재 |
| 35 | 헬스케어 |
| 40 | 금융 |
| 45 | IT |
| 50 | 커뮤니케이션 서비스 |
| 55 | 유틸리티 |
| 60 | 부동산 |

## API 엔드포인트

| Method | Endpoint | 설명 | 인증 |
|--------|----------|------|------|
| POST | /api/v1/auth/register | 회원가입 | - |
| POST | /api/v1/auth/login | 로그인 | - |
| POST | /api/v1/auth/refresh | 토큰 갱신 | - |
| GET | /api/v1/auth/me | 내 정보 | Bearer |
| GET | /api/v1/analysts | 애널리스트 목록 (필터/정렬) | - |
| GET | /api/v1/analysts/{id} | 애널리스트 상세 | - |
| GET | /api/v1/reports | 리포트 검색 (필터) | - |
| GET | /api/v1/reports/{id} | 리포트 상세 | - |
| GET | /api/v1/stocks | 종목 목록 (검색/필터) | - |
| GET | /api/v1/stocks/{id} | 종목 상세 | - |
| GET | /api/v1/stocks/{id}/consensus | 종목 컨센서스 | - |
| GET | /api/v1/rankings | 랭킹 (기간/섹터) | - |
| GET | /api/v1/boards | 게시판 목록 | - |
| GET | /api/v1/boards/{slug}/posts | 게시글 목록 | - |
| POST | /api/v1/boards/{slug}/posts | 게시글 작성 | Bearer |
| GET | /api/v1/boards/{slug}/posts/{id} | 게시글 상세 | - |
| GET | /api/v1/boards/{slug}/posts/{id}/comments | 댓글 목록 | - |
| POST | /api/v1/boards/{slug}/posts/{id}/comments | 댓글 작성 | Bearer |
| GET | /health | 헬스체크 | - |

## 데이터 수집 파이프라인 (미구현)
```
[스케줄러] → [수집기] → [파서] → [DB 저장] → [주가 추적] → [성과 분석] → [랭킹 갱신]
   매일        크롤링      정규화     리포트      일별/주별      월별         월별
```
- 수집 대상: 한경 컨센서스 (투자의견, 목표가, 애널리스트명, 증권사)
- 주가 데이터: pykrx (수정주가)

## 개발 규칙
1. **서비스 레이어 패턴**: API 라우터는 얇게, 비즈니스 로직은 services/에
2. **비동기 작업**: 수집/분석은 반드시 Celery 태스크로 (동기 API 블로킹 금지)
3. **데이터 무결성**: 중복 리포트 방지 (analyst + stock + date 복합 유니크)
4. **증분 수집**: 매번 전체 크롤링이 아닌 마지막 수집 이후 신규 데이터만
5. **주가 데이터 캐싱**: Redis에 당일 주가 캐시 (TTL: 장 마감 후 갱신)
6. **에러 복원력**: 크롤링 실패 시 재시도 3회, 부분 실패 허용
7. **UI 스타일**: Apple 미니멀 (보라색 그라데이션, 네온 글로우 금지)

## Claude Code Skills (15개)

### 오케스트레이터
| Skill | 설명 | 호출 |
|-------|------|------|
| dev | 개발 오케스트레이터 - 전체 워크플로우 관리 및 agent 위임 | `/dev` |

### 설계 & 조사
| Skill | 설명 | 호출 |
|-------|------|------|
| planner | 아키텍처 설계 및 구현 계획 | `/planner` |
| data-architect | 데이터 모델, 수집 파이프라인, 스코어링 알고리즘 설계 | `/data-architect` |
| researcher | 외부 기술, API, 데이터 소스 조사 | `/researcher` |
| ui-designer | UI/UX 설계, 디자인 시스템, 와이어프레임 | `/ui-designer` |

### 구현
| Skill | 설명 | 호출 |
|-------|------|------|
| frontend | Next.js + TypeScript 프론트엔드 구현 | `/frontend` |

### 검증
| Skill | 설명 | 호출 |
|-------|------|------|
| tester | Playwright E2E 테스트 실행 및 시험 항목 관리 | `/tester` |
| reviewer | 코드 리뷰 - 품질, 보안, 성능, 데이터 무결성 | `/reviewer` |
| ux-reviewer | UX 리뷰 - 사용성, 접근성, 반응형, 시각화 품질 | `/ux-reviewer` |
| debugger | 디버깅 - 근본 원인 추적 및 수정 | `/debugger` |

### 유지보수
| Skill | 설명 | 호출 |
|-------|------|------|
| documenter | CLAUDE.md, README.md 문서화 | `/documenter` |
| docker-up | Docker Compose 서비스 시작 | `/docker-up` |
| docker-down | Docker Compose 서비스 중지 | `/docker-down` |
| docker-status | Docker Compose 서비스 상태 확인 | `/docker-status` |

### 워크플로우
```
사용자 요청 → /dev (유형 판단)
  ├─ 백엔드 작업: /planner → /data-architect → /researcher → 구현 → /tester → /reviewer
  ├─ 프론트엔드 작업: /planner → /ui-designer → /frontend → /tester → /reviewer + /ux-reviewer
  ├─ 풀스택 작업: 설계(백+프론트) → 백엔드 구현 → 프론트엔드 구현 → /tester → /reviewer + /ux-reviewer
  └─ 소규모 작업: 구현 → /tester → /reviewer
```

## 구현 현황

| 구성 | 상태 |
|------|------|
| Docker Compose (6개 서비스) | 구현 완료 |
| DB 모델 9개 + Alembic 마이그레이션 | 구현 완료 |
| Auth API (JWT) | 구현 완료 |
| 핵심 API 6개 (analysts, reports, stocks, rankings, boards, auth) | 구현 완료 |
| Frontend 10개 페이지 (Apple 스타일) | 구현 완료 (API 연동) |
| Playwright E2E 테스트 65건 | 구현 완료 (ALL PASS) |
| 데이터 수집 파이프라인 | 구현 완료 |
| 스코어링 엔진 | 구현 완료 |
| Frontend API 연동 | 구현 완료 |
| 실제 데이터 연동 | **미구현** (가짜 데이터 → 실제 데이터 전환) |
