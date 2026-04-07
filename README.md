# theRankers

국내 증권사 애널리스트의 투자의견과 목표가를 추적하고, 실제 주가 성과와 비교하여 애널리스트별 정확도를 랭킹화하는 서비스.

## 주요 기능

- **애널리스트 랭킹** - 목표가 달성률, 초과수익률, 방향 정확도, 일관성 기반 100% 정량 평가
- **종목별 컨센서스** - 매수/중립/매도 분포, 평균 목표가, 상승 여력
- **주가 차트** - Recharts 기반 종가 라인 차트 + 목표가 참조선
- **애널리스트별 목표가 차트** - 도트 차트로 목표가 분포 시각화
- **리포트 상세** - 메타데이터 + 주가 추적 (1m/3m/6m/12m) + 관련 리포트
- **글로벌 검색** - 종목명 + 애널리스트 통합 검색 (디바운스 적용)
- **반응형 레이아웃** - 데스크톱 테이블 + 모바일 카드
- **커뮤니티** - 종목별/애널리스트별/증권사별 게시판
- **회원 시스템** - 회원가입, 로그인, 게시글/댓글 작성
- **자동 데이터 수집** - Celery 스케줄로 매일 리포트/주가/랭킹 자동 갱신

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL 16, Redis 7 |
| Auth | JWT (PyJWT + bcrypt) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Recharts |
| Data | httpx (크롤링), pykrx (주가), Pandas/NumPy (분석) |
| Task Queue | Celery + Redis |
| Container | Docker Compose |
| E2E Test | Playwright (71건) |

## 실행 방법

### 사전 요구사항
- Docker Desktop

### 시작
```bash
git clone https://github.com/tr2vil/theRankers.git
cd theRankers
docker compose up --build -d
```

### DB 마이그레이션 (최초 1회)
```bash
docker compose exec backend alembic upgrade head
```

### 데이터 수집 (최초 1회)
```bash
docker compose exec backend python scripts/sprint6_collect.py 30
```

### 접속
| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

### 종료
```bash
docker compose down
```

## E2E 테스트

```bash
cd e2e
npm install
npx playwright install chromium
npx playwright test --reporter=html
```

테스트 완료 후 `e2e/playwright-report/index.html`에서 결과를 확인할 수 있습니다.

## Docker 서비스 구성

| 서비스 | 포트 | 설명 |
|--------|------|------|
| postgres | 5432 | PostgreSQL 16 |
| redis | 6379 | Redis 7 |
| backend | 8000 | FastAPI (uvicorn, hot-reload) |
| frontend | 3000 | Next.js 14 (dev server) |
| celery-worker | - | Celery 워커 (수집/분석) |
| celery-beat | - | Celery 스케줄러 (07:00 수집, 16:30 주가, 18:00 랭킹) |

## 환경 변수

`.env` 파일을 프로젝트 루트에 생성합니다:

```env
POSTGRES_PASSWORD=therankers_dev
SECRET_KEY=dev-secret-key-change-in-production
ENVIRONMENT=development
```

## 프로젝트 구조

```
theRankers/
├── backend/          # FastAPI API 서버 (7개 라우터, 21개 엔드포인트)
│   ├── app/
│   │   ├── api/      # auth, analysts, reports, stocks, rankings, boards, search
│   │   ├── models/   # SQLAlchemy 모델 9개
│   │   ├── services/ # collector(한경), analysis(스코어링), market(주가)
│   │   └── tasks/    # Celery 태스크 (수집, 분석, 스케줄)
│   ├── scripts/      # 데이터 수집 스크립트
│   └── migrations/   # Alembic 마이그레이션
├── frontend/         # Next.js 프론트엔드 (11개 페이지)
├── e2e/              # Playwright E2E 테스트 (6개 파일, 71건)
├── .claude/          # Claude Code 스킬 정의 (15개)
├── docker-compose.yml
├── CLAUDE.md         # AI 개발 가이드
├── TODO.md           # 개발 로드맵
└── README.md
```

## 라이선스

Private
