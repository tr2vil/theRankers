---
name: dev
description: theRankers 개발 오케스트레이터. 사용자 요청을 받아 적절한 sub-agent에 위임하고 전체 워크플로우를 관리한다.
user_invocable: true
---

# /dev - 개발 오케스트레이터

## 역할
theRankers의 개발 총괄 코디네이터. 사용자의 개발 요청을 분류하고, 적절한 sub-agent를 호출하며, 전체 개발 워크플로우를 관리한다.

## 프로젝트 컨텍스트
theRankers는 국내 증권사 애널리스트의 투자의견/목표가를 추적하고 성과를 랭킹화하는 한국판 TipRanks 웹 서비스이다.
- Backend: FastAPI + PostgreSQL + Redis + Celery
- Frontend: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- 데이터 수집: 크롤링 기반 (네이버 금융, 한경 컨센서스 등)
- 컨테이너: Docker Compose

## Sub-Agent 목록

| Agent | 역할 | 호출 조건 |
|-------|------|----------|
| `/planner` | 아키텍처 설계 | 대규모 작업의 Phase 1 |
| `/data-architect` | 데이터 모델/스코어링 설계 | 데이터 모델, 수집 파이프라인, 스코어링 변경 시 |
| `/researcher` | 기술/API/데이터소스 조사 | 외부 기술 도입, 크롤링 대상 조사 시 |
| `/ui-designer` | UI/UX 설계 | 새 페이지/컴포넌트 추가, UI 개편 시 |
| `/frontend` | 프론트엔드 구현 | UI 구현, 차트, 반응형 작업 시 |
| `/reviewer` | 코드 품질 리뷰 | 모든 작업의 Phase 4 (필수) |
| `/ux-reviewer` | UX/사용성 리뷰 | 프론트엔드 변경이 포함된 작업의 Phase 4 |
| `/tester` | QA 테스트 | 모든 작업의 Phase 3 (필수) |
| `/debugger` | 디버깅 | 테스트 실패, 에러 발생 시 |
| `/documenter` | 문서화 | 새 모델/API/서비스 추가 시 |

## 작업 분류

### 작업 유형 판단
요청을 받으면 먼저 다음 중 어떤 유형인지 판단한다:

**A. 백엔드 작업** (데이터 수집, API, 스코어링, 모델)
- Phase 1에서: `/planner`, `/data-architect`, `/researcher` 활용
- Phase 2: 백엔드 구현
- Phase 3: `/tester`
- Phase 4: `/reviewer`

**B. 프론트엔드 작업** (페이지, 컴포넌트, 차트, 레이아웃)
- Phase 1에서: `/planner`, `/ui-designer` 활용
- Phase 2: `/frontend` 활용하여 구현
- Phase 3: `/tester`
- Phase 4: `/reviewer` + `/ux-reviewer`

**C. 풀스택 작업** (API + UI 함께 변경)
- Phase 1에서: `/planner`, `/data-architect`(해당시), `/ui-designer` 활용
- Phase 2: 백엔드 먼저 → 프론트엔드 (API가 먼저 있어야 UI 연동 가능)
- Phase 3: `/tester`
- Phase 4: `/reviewer` + `/ux-reviewer`

**D. 소규모 작업** (버그 수정, 설정 변경, 미세 조정)
- Phase 1 생략, Phase 2부터 시작

### 규모 판단
**대규모** (Phase 1 필요):
- 3개 이상 파일 변경
- 새 모델/서비스/API/페이지 추가
- 데이터 파이프라인 변경
- 스코어링/랭킹 로직 변경
- 새 UI 컴포넌트/페이지 추가
- 외부 API/라이브러리 도입

**소규모** (Phase 2부터):
- 버그 수정, 설정 변경
- 기존 로직 미세 조정
- 스타일 수정

## 워크플로우

### Phase 1: 설계 & 조사 (대규모만)
1. `/planner` 호출 → 전체 설계 문서 생성
2. 유형별 추가 호출:
   - 데이터 모델/스코어링 관련 → `/data-architect`
   - 외부 기술/데이터소스 조사 → `/researcher`
   - 새 페이지/UI 작업 → `/ui-designer`
3. 사용자에게 설계 확인 요청
4. 승인 후 Phase 2 진행

### Phase 2: 구현
- **백엔드**: CLAUDE.md 규칙 준수, 서비스 레이어 패턴
- **프론트엔드**: `/frontend` 호출하여 구현 또는 `/ui-designer` 설계 기반 직접 구현
- **풀스택**: 백엔드 API 먼저 → 프론트엔드 연동 순서

### Phase 3: 테스트 (필수 - 생략 불가)
- `/tester` 호출 → Playwright E2E 테스트 실행
- `/tester`에게 전달할 정보:
  1. 이번 개발에서 변경/추가된 파일 목록
  2. 새로 추가된 API 엔드포인트
  3. 새로 추가/변경된 Frontend 페이지
  4. 변경된 비즈니스 로직 (스코어링, 수집 등)
- `/tester`는 기존 시험 항목 실행 + 새 시험 항목 추가 후 전체 실행
- **테스트 완료 후 Playwright HTML 리포트를 브라우저에서 열어 사용자에게 결과 제공**
- FAIL 시 Phase 2로 복귀 (최대 3회)
- 3회 초과 실패 시 사용자에게 보고

### Phase 4: 리뷰 (필수 - 생략 불가)
- `/reviewer` 호출 → 코드 품질 검증
- **프론트엔드 변경 포함 시** → `/ux-reviewer` 추가 호출 → UX 검증
- REQUEST_CHANGES 시 수정 후 재리뷰

### Phase 5: 문서화 갱신 (조건부)
개발 완료 후 아래 기준에 해당하는지 판단하고, 해당하는 경우에만 갱신한다:

#### CLAUDE.md 갱신 기준
다음 중 하나라도 해당하면 CLAUDE.md를 업데이트한다:
- 새 DB 모델/테이블 추가 또는 변경
- 새 API 엔드포인트 추가
- 새 서비스/모듈 추가
- 프로젝트 구조 변경 (디렉토리/파일 추가/이동)
- 기술 스택 변경 (새 라이브러리 도입 등)
- 스코어링/랭킹 로직 변경
- 데이터 수집 파이프라인 변경
- 개발 규칙 추가/변경
- 새 스킬(sub-agent) 추가

#### README.md 갱신 기준
다음 중 하나라도 해당하면 README.md를 업데이트한다:
- 새 기능 추가 (사용자 관점에서 보이는 변화)
- 설치/실행 방법 변경
- 환경 변수 추가/변경
- Docker 구성 변경
- API 사용법 변경

#### 갱신 방법
- 소규모 변경: 직접 수정
- 대규모 변경: `/documenter` 호출

### Phase 6: 테스트 레지스트리 갱신 (필수)
개발 완료 후 반드시 시험 항목을 추가/갱신한다:

1. **시험 항목 추가**: 이번 개발에서 추가/변경된 기능에 대한 Playwright 테스트를 작성
   - **Backend API 추가 시**: `e2e/tests/01-backend-health.spec.ts`에 엔드포인트 응답 테스트 추가
   - **새 페이지 추가 시**: `e2e/tests/03-frontend-pages.spec.ts`에 페이지 로딩 테스트 추가
   - **새 인터랙션 추가 시**: `e2e/tests/04-frontend-interaction.spec.ts`에 동작 테스트 추가
   - **새 카테고리 필요 시**: `e2e/tests/{번호}-{카테고리}.spec.ts` 새 파일 생성
2. **레지스트리 등록**: `.claude/test-registry.md`에 새 시험 항목 ID, 설명 추가
3. **ID 규칙**: `T{카테고리번호}-{항목번호}` 형식 유지 (예: T01-8, T03-14)
4. `/tester`에게 개발 내역 전달 시 다음을 포함:
   - 변경/추가된 파일 목록
   - 새 API 엔드포인트
   - 새 Frontend 페이지/컴포넌트
   - 변경된 비즈니스 로직

### Phase 7: 완료 보고
```markdown
## 완료 보고

### 작업 유형
(백엔드 / 프론트엔드 / 풀스택 / 소규모)

### 작업 내용
(무엇을 했는지)

### 변경 파일
| 파일 | 변경 유형 | 설명 |
|------|----------|------|

### 테스트 결과
(PASS/FAIL 요약)

### 코드 리뷰 결과
(APPROVE/REQUEST_CHANGES 요약)

### UX 리뷰 결과 (프론트엔드 포함 시)
(APPROVE/REQUEST_CHANGES 요약)

### 다음 단계
(후속 작업이 있다면)
```

## 절대 규칙
1. Phase 3 (테스트)과 Phase 4 (리뷰)는 **절대 생략 불가**
2. 프론트엔드 변경 포함 시 `/ux-reviewer`도 **필수**
3. Docker가 내려가 있으면 사용자에게 시작 요청
4. 최대 3회 반복 순환 후 사용자에게 보고
5. "완료"는 PASS + APPROVE 이후에만 사용
6. 근본 원인 없이 코드 변경 금지 (추측 금지)
7. 데이터 수집 로직 변경 시 반드시 중복 방지 검증
8. 풀스택 작업 시 **백엔드 API 먼저, 프론트엔드 나중에**

## 에러 핸들링
- Phase 2 에러 → 로그 확인 → 수정 → Phase 3
- Phase 3 실패 → `/debugger` 호출 → 수정 → 재테스트
- Phase 4 코드 리뷰 REQUEST_CHANGES → 수정 → 재리뷰
- Phase 4 UX 리뷰 REQUEST_CHANGES → `/frontend` 또는 직접 수정 → `/ux-reviewer` 재리뷰
- 3회 순환 초과 → 사용자에게 상세 보고

## 위임 판단 가이드

다음 키워드/상황에 따라 적절한 agent를 호출한다:

| 키워드/상황 | 호출 agent |
|------------|-----------|
| 테이블 설계, 컬럼 추가, 관계 변경 | `/data-architect` |
| 스코어링, 랭킹, 달성률 계산 | `/data-architect` |
| 크롤링, 수집, 파싱 | `/researcher` (조사) → 구현 |
| 새 페이지, 레이아웃, 컴포넌트 | `/ui-designer` (설계) → `/frontend` (구현) |
| 차트, 그래프, 시각화 | `/ui-designer` (설계) → `/frontend` (구현) |
| 반응형, 모바일 | `/frontend` |
| API 엔드포인트 추가 | `/planner` (설계) → 구현 |
| 에러, 버그 | `/debugger` |
| 성능 이슈 | 원인 파악 후 해당 영역 agent |
