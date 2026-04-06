# theRankers - 한국판 TipRanks

## 프로젝트 개요
국내 증권사 애널리스트의 투자의견과 목표가를 추적하고, 실제 주가 성과와 비교하여 애널리스트별 정확도를 랭킹화하는 서비스.

## 핵심 가치
- 애널리스트 리포트의 "매수 편향"을 데이터로 검증
- 목표가 달성률, 초과수익률 기반 정량 평가
- 개인 투자자에게 신뢰할 수 있는 애널리스트 판별 근거 제공

## 기술 스택
- **Backend**: Python / FastAPI
- **Database**: PostgreSQL (영구 데이터) + Redis (캐시/실시간)
- **ORM**: SQLAlchemy 2.0 + Alembic (마이그레이션)
- **Data Collection**: Scrapy / BeautifulSoup / Selenium (리포트 수집)
- **Data Analysis**: Pandas / NumPy (성과 분석)
- **Stock Price API**: pykrx / FinanceDataReader (국내 주가 데이터)
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Container**: Docker Compose
- **Task Queue**: Celery + Redis (비동기 수집/분석 작업)

## 프로젝트 구조
```
theRankers/
├── .claude/                    # Claude Code 설정
│   ├── settings.local.json    # 도구 권한 및 스킬 정의
│   ├── skills/                # Sub-agent 정의
│   │   ├── dev/               # 오케스트레이터
│   │   ├── planner/           # 설계자
│   │   ├── researcher/        # 조사원
│   │   ├── data-architect/    # 데이터 아키텍트 (신규)
│   │   ├── reviewer/          # 코드 리뷰어
│   │   ├── tester/            # QA 엔지니어
│   │   ├── debugger/          # 디버거
│   │   └── documenter/        # 문서화 담당
│   └── test-registry.md       # 누적 테스트 케이스
├── backend/                    # FastAPI 애플리케이션
│   ├── app/
│   │   ├── main.py            # FastAPI 앱 엔트리포인트
│   │   ├── config.py          # 환경 설정
│   │   ├── database.py        # DB 연결 및 세션
│   │   ├── models/            # SQLAlchemy 모델
│   │   │   ├── analyst.py     # 애널리스트
│   │   │   ├── report.py      # 리포트 (투자의견, 목표가)
│   │   │   ├── stock.py       # 종목 정보
│   │   │   ├── price.py       # 주가 데이터
│   │   │   └── ranking.py     # 랭킹 스냅샷
│   │   ├── schemas/           # Pydantic 스키마
│   │   ├── api/               # API 라우터
│   │   │   ├── analysts.py    # 애널리스트 조회/랭킹
│   │   │   ├── reports.py     # 리포트 조회/검색
│   │   │   ├── stocks.py      # 종목별 분석
│   │   │   └── rankings.py    # 랭킹 API
│   │   ├── services/          # 비즈니스 로직
│   │   │   ├── collector/     # 데이터 수집
│   │   │   │   ├── naver.py   # 네이버 금융 크롤러
│   │   │   │   ├── hankyung.py# 한경 컨센서스
│   │   │   │   └── parser.py  # 리포트 파싱
│   │   │   ├── analysis/      # 성과 분석
│   │   │   │   ├── scorer.py  # 스코어링 엔진
│   │   │   │   ├── tracker.py # 목표가 추적
│   │   │   │   └── ranker.py  # 랭킹 계산
│   │   │   └── market/        # 시장 데이터
│   │   │       └── price.py   # 주가 조회
│   │   └── tasks/             # Celery 비동기 작업
│   │       ├── collect.py     # 수집 태스크
│   │       ├── analyze.py     # 분석 태스크
│   │       └── schedule.py    # 스케줄링
│   ├── migrations/            # Alembic 마이그레이션
│   ├── tests/                 # pytest 테스트
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                   # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/               # App Router
│   │   ├── components/        # UI 컴포넌트
│   │   ├── lib/               # API 클라이언트
│   │   └── types/             # TypeScript 타입
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # PostgreSQL, Redis, Backend, Frontend, Celery Worker
├── CLAUDE.md                   # AI 개발 가이드 (이 파일)
├── README.md
└── project-context.md          # 장기 비전
```

## 핵심 도메인 모델

### Analyst (애널리스트)
- id, name, firm (증권사), sector (담당 섹터)
- 성과 지표: accuracy_rate, avg_return, total_reports, ranking_score

### Report (리포트)
- id, analyst_id, stock_id
- opinion (매수/중립/매도), target_price, report_date
- 추적 결과: price_at_report, price_1m, price_3m, price_6m, price_12m
- target_achieved (boolean), achieved_date

### Stock (종목)
- id, code (종목코드), name, sector, market (KOSPI/KOSDAQ)

### Ranking (랭킹 스냅샷)
- analyst_id, period, rank, score, calculated_at

## 스코어링 로직

### 1. 목표가 달성률 (Target Hit Rate)
- 리포트 발행 후 12개월 내 목표가 도달 여부
- 가중치: 40%

### 2. 수익률 정확도 (Return Accuracy)
- 투자의견 방향 대비 실제 수익률
- 매수 의견 → 양수 수익률이면 정확
- 가중치: 30%

### 3. 초과수익률 (Excess Return)
- 리포트 기준 수익률 - 동기간 KOSPI/KOSDAQ 수익률
- 가중치: 20%

### 4. 일관성 (Consistency)
- 편차가 적을수록 높은 점수
- 가중치: 10%

## 데이터 수집 파이프라인
```
[스케줄러] → [수집기] → [파서] → [DB 저장] → [주가 추적] → [성과 분석] → [랭킹 갱신]
   매일        크롤링      정규화     리포트      일별/주별      월별         월별
```

## 개발 규칙
1. **서비스 레이어 패턴**: API 라우터는 얇게, 비즈니스 로직은 services/에
2. **비동기 작업**: 수집/분석은 반드시 Celery 태스크로 (동기 API 블로킹 금지)
3. **데이터 무결성**: 중복 리포트 방지 (analyst + stock + date 복합 유니크)
4. **증분 수집**: 매번 전체 크롤링이 아닌 마지막 수집 이후 신규 데이터만
5. **주가 데이터 캐싱**: Redis에 당일 주가 캐시 (TTL: 장 마감 후 갱신)
6. **에러 복원력**: 크롤링 실패 시 재시도 3회, 부분 실패 허용

## Claude Code Skills

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
| ui-designer | UI/UX 설계, 디자인 시스템, 와이어프레임, 데이터 시각화 설계 | `/ui-designer` |

### 구현
| Skill | 설명 | 호출 |
|-------|------|------|
| frontend | Next.js + TypeScript 프론트엔드 구현 | `/frontend` |

### 검증
| Skill | 설명 | 호출 |
|-------|------|------|
| tester | QA 테스트 - 기능, 데이터 정합성, 파이프라인 검증 | `/tester` |
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

### 워크플로우 (오케스트레이터 위임 규칙)
```
사용자 요청 → /dev (유형 판단)
  ├─ 백엔드 작업: /planner → /data-architect → /researcher → 구현 → /tester → /reviewer
  ├─ 프론트엔드 작업: /planner → /ui-designer → /frontend → /tester → /reviewer + /ux-reviewer
  ├─ 풀스택 작업: 설계(백+프론트) → 백엔드 구현 → 프론트엔드 구현 → /tester → /reviewer + /ux-reviewer
  └─ 소규모 작업: 구현 → /tester → /reviewer
```
