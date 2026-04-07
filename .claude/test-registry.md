# theRankers 테스트 레지스트리

> 개발 과정에서 누적되는 테스트 케이스 저장소.
> `/tester`가 테스트 계획 시 참조하고, `/dev`가 새 기능 추가 시 갱신한다.

---

## Playwright E2E 테스트 (e2e/tests/)

최종 실행: 2026-04-07 | 결과: **71/71 PASS**

### T01: Backend API 헬스체크 (01-backend-health.spec.ts)
| ID | 시험 항목 | 상태 |
|----|----------|------|
| T01-1 | /health 엔드포인트 응답 확인 | PASS |
| T01-2 | /docs (Swagger) 접근 확인 | PASS |
| T01-3 | /api/v1/analysts 엔드포인트 응답 | PASS |
| T01-4 | /api/v1/rankings 엔드포인트 응답 | FIXED |
| T01-5 | /api/v1/stocks 엔드포인트 응답 | PASS |
| T01-6 | /api/v1/reports 엔드포인트 응답 | PASS |
| T01-7 | /api/v1/boards 엔드포인트 응답 | PASS |

### T02: Auth API 기능 시험 (02-auth-api.spec.ts)
| ID | 시험 항목 | 상태 |
|----|----------|------|
| T02-1 | 회원가입 성공 | FIXED |
| T02-2 | 중복 이메일 회원가입 거부 | FIXED |
| T02-3 | 로그인 성공 | FIXED |
| T02-4 | 잘못된 비밀번호 로그인 거부 | FIXED |
| T02-5 | 토큰으로 내 정보 조회 | FIXED |
| T02-6 | 토큰 없이 내 정보 조회 거부 | PASS |
| T02-7 | 토큰 갱신 | FIXED |

### T03: Frontend 페이지 로딩 (03-frontend-pages.spec.ts)
| ID | 시험 항목 | 상태 |
|----|----------|------|
| T03-1 | 메인 페이지 로딩 + Hero 텍스트 | PASS |
| T03-2 | 메인 - Top 애널리스트 섹션 | FIXED |
| T03-3 | 메인 - 최신 리포트 섹션 | PASS |
| T03-4 | 메인 - CTA 섹션 | PASS |
| T03-5 | 랭킹 페이지 로딩 | PASS |
| T03-6 | 애널리스트 목록 페이지 로딩 | PASS |
| T03-7 | 애널리스트 상세 페이지 로딩 | FIXED |
| T03-8 | 종목 목록 페이지 로딩 | PASS |
| T03-9 | 종목 상세 페이지 로딩 | FIXED |
| T03-10 | 리포트 페이지 로딩 | PASS |
| T03-11 | 커뮤니티 게시판 페이지 로딩 | FIXED |
| T03-12 | 로그인 페이지 로딩 | PASS |
| T03-13 | 회원가입 페이지 로딩 | PASS |
| T03-14 | 리포트 상세 페이지 로딩 (API) | PASS |

### T04: Frontend 인터랙션 (04-frontend-interaction.spec.ts)
| ID | 시험 항목 | 상태 |
|----|----------|------|
| T04-1 | 헤더 네비게이션 - 랭킹 | PASS |
| T04-2 | 헤더 네비게이션 - 애널리스트 | PASS |
| T04-3 | 헤더 네비게이션 - 종목 | PASS |
| T04-4 | 헤더 네비게이션 - 리포트 | PASS |
| T04-5 | 헤더 네비게이션 - 커뮤니티 | PASS |
| T04-6 | 메인 - 랭킹 보기 버튼 | PASS |
| T04-7 | 메인 - 리포트 검색 버튼 | PASS |
| T04-8 | 메인 - 무료로 시작하기 버튼 | PASS |
| T04-9 | 헤더 - 로그인 버튼 | PASS |
| T04-10 | 로그인 - 회원가입 링크 | PASS |
| T04-11 | 회원가입 - 로그인 링크 | PASS |
| T04-12 | 랭킹 - 기간 선택 변경 | PASS |
| T04-13 | 애널리스트 - 검색 필터 | PASS |
| T04-14 | 애널리스트 - 증권사 필터 | PASS |
| T04-15 | 리포트 - 의견 필터 | PASS |
| T04-16 | 게시판 - 글쓰기 폼 토글 | PASS |
| T04-17 | 종목 - 섹터 필터 | PASS |
| T04-18 | 종목 상세 - 애널리스트 신뢰도 테두리 | PASS |
| T04-19 | 리포트 목록 → 상세 페이지 이동 | PASS |
| T04-20 | 헤더 - 글로벌 검색 | PASS |

### T05: Sprint 4 Backend 기능 시험 (05-sprint4-backend.spec.ts)
| ID | 시험 항목 | 상태 |
|----|----------|------|
| T05-1 | /api/v1/analysts 실제 데이터 존재 확인 | PASS |
| T05-2 | /api/v1/rankings 실제 랭킹 데이터 + 점수 분해 필드 | PASS |
| T05-3 | /api/v1/rankings 기간별 필터 (1m/3m/6m/12m) | PASS |
| T05-4 | /api/v1/stocks 실제 종목 데이터 + GICS 섹터 | PASS |
| T05-5 | /api/v1/reports 실제 리포트 데이터 + 조인 필드 | PASS |
| T05-6 | /api/v1/boards 게시판 데이터 확인 | PASS |
| T05-7 | /api/v1/analysts 증권사 필터 동작 | PASS |
| T05-8 | /api/v1/reports 투자의견 필터 동작 | PASS |
| T05-9 | 랭킹 순서 정합성 (rank 오름차순, score 내림차순) | PASS |
| T05-10 | 스코어 합산 정합성 (4개 지표 합 = total) | PASS |

---

### T06: Sprint 5 API 연동 시험 (06-sprint5-api-integration.spec.ts)
| ID | 시험 항목 | 상태 |
|----|----------|------|
| T06-1 | 메인 대시보드 - 랭킹 API 데이터 렌더링 | PASS |
| T06-2 | 메인 대시보드 - 리포트 API 데이터 렌더링 | PASS |
| T06-3 | 랭킹 페이지 - API 데이터 + 기간 전환 | PASS |
| T06-4 | 애널리스트 상세 - API 데이터 로딩 | PASS |
| T06-5 | 종목 상세 - Consensus API 데이터 | PASS |
| T06-6 | 리포트 페이지 - 페이지네이션 | PASS |
| T06-7 | 종목 페이지 - 검색 필터 API 연동 | PASS |
| T06-8 | 게시판 - 보드 탭 API 연동 | PASS |
| T06-9 | Backend consensus API 정상 응답 | PASS |
| T06-10 | Backend reports 검색 API 동작 | PASS |
| T06-11 | Backend report detail API 추적 필드 포함 | PASS |
| T06-12 | Backend 주가 API 응답 | PASS |
| T06-13 | Backend 통합 검색 API 동작 | PASS |

---

## 결함 수정 이력

| 결함 | 원인 | 수정 내용 |
|------|------|----------|
| T01-3~7, T02 전체 500 에러 | DB 마이그레이션 미실행 (테이블 없음) | `alembic upgrade head` 실행, `migrations/versions/` 디렉토리 생성 |
| T01-4 Rankings 500 에러 | `calculated_at`이 None일 때 Pydantic 검증 실패 | `ranking.py` 스키마에서 `date` → `date | None` 변경 |
| T03-2 strict mode | "text=김서연" 다중 매칭 | `h2:text('Top 애널리스트')` 로케이터로 변경 |
| T03-7 strict mode | 애널리스트 상세 페이지 로케이터 | `h1` + `.first()` 사용 |
| T03-9 strict mode | "text=삼성전자" 2개 매칭 | `getByRole('heading')` 로케이터로 변경 |
| T03-11 strict mode | "text=커뮤니티" 3개 매칭 | `h1` + `toContainText` 로케이터로 변경 |

## 시험 실행 방법
```bash
cd e2e
npx playwright test
```

## 상태 범례
- `PASS`: 최초 통과
- `FIXED`: 결함 수정 후 재통과
- `FAIL`: 미해결 실패
