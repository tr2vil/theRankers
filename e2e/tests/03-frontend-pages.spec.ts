import { test, expect } from "@playwright/test";

test.describe("T03: Frontend 페이지 로딩 시험", () => {
  test("T03-1: 메인 페이지 로딩", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/theRankers/);
    // Hero 텍스트 확인
    await expect(page.locator("text=누가 진짜 잘 맞추는지")).toBeVisible();
    await expect(page.locator("text=데이터가 말해줍니다")).toBeVisible();
  });

  test("T03-2: 메인 페이지 - Top 애널리스트 섹션", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Top 애널리스트")).toBeVisible();
    await expect(page.locator("h2:text('Top 애널리스트')")).toBeVisible();
  });

  test("T03-3: 메인 페이지 - 최신 리포트 섹션 (API)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=최신 리포트")).toBeVisible();
    // Wait for API data to load - check for 목표가 text
    await expect(page.locator("text=목표가").first()).toBeVisible({ timeout: 10000 });
  });

  test("T03-4: 메인 페이지 - CTA 섹션", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=무료로 시작하기")).toBeVisible();
  });

  test("T03-5: 랭킹 페이지 로딩 (API)", async ({ page }) => {
    await page.goto("/rankings");
    await expect(page.locator("h1:text('애널리스트 랭킹')")).toBeVisible();
    // 기간 선택 버튼
    await expect(page.locator("text=12개월")).toBeVisible();
    // Wait for API ranking data to load
    await expect(page.locator("text=순위").first()).toBeVisible({ timeout: 10000 });
  });

  test("T03-6: 애널리스트 목록 페이지 로딩 (API)", async ({ page }) => {
    await page.goto("/analysts");
    await expect(page.locator("h1:text('애널리스트')")).toBeVisible();
    // 검색 필드
    await expect(page.locator("input[placeholder*='검색']")).toBeVisible();
    // Wait for API data - analyst cards should appear
    await expect(page.locator("text=종합 점수").first()).toBeVisible({ timeout: 10000 });
  });

  test("T03-7: 애널리스트 상세 페이지 로딩 (API)", async ({ page }) => {
    await page.goto("/analysts/1");
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    // 점수 구성 카드
    await expect(page.locator("text=목표가 달성률")).toBeVisible();
    await expect(page.locator("text=초과수익률").first()).toBeVisible();
  });

  test("T03-8: 종목 목록 페이지 로딩 (API)", async ({ page }) => {
    await page.goto("/stocks");
    await expect(page.locator("h1:text('종목')")).toBeVisible();
    // Wait for API data
    await expect(page.locator("text=삼성전자")).toBeVisible({ timeout: 10000 });
  });

  test("T03-9: 종목 상세 페이지 로딩 (API) + 주가 차트", async ({ page }) => {
    await page.goto("/stocks/005930");
    await expect(page.getByRole("heading", { name: "삼성전자" })).toBeVisible({ timeout: 10000 });
    // 주가 차트
    await expect(page.locator("text=주가 추이")).toBeVisible();
    // 컨센서스 분포
    await expect(page.locator("text=투자의견 분포")).toBeVisible();
    await expect(page.locator("text=목표가 범위")).toBeVisible();
    // 애널리스트별 목표가 차트
    await expect(page.locator("text=애널리스트별 목표가")).toBeVisible();
  });

  test("T03-10: 리포트 페이지 로딩 (API)", async ({ page }) => {
    await page.goto("/reports");
    await expect(page.locator("h1:text('리포트')")).toBeVisible();
    await expect(page.locator("input[placeholder*='검색']")).toBeVisible();
    // 의견 필터 버튼
    await expect(page.locator("button:text('매수')")).toBeVisible();
    // Wait for API data
    await expect(page.locator("text=목표가").first()).toBeVisible({ timeout: 10000 });
  });

  test("T03-11: 커뮤니티 게시판 페이지 로딩 (API)", async ({ page }) => {
    await page.goto("/boards/general");
    await expect(page.locator("h1")).toContainText("커뮤니티");
    await expect(page.locator("button:text('글쓰기')")).toBeVisible();
  });

  test("T03-14: 리포트 상세 페이지 로딩 (API)", async ({ page }) => {
    // First get a valid report ID
    const reportsRes = await page.request.get("http://localhost:8000/api/v1/reports?page=1&size=1");
    const reportsData = await reportsRes.json();
    const reportId = reportsData.items[0]?.id;
    if (!reportId) return;

    await page.goto(`/reports/${reportId}`);
    // Should show report header with opinion badge
    await expect(page.locator("text=목표가").first()).toBeVisible({ timeout: 10000 });
    // Should show key metrics
    await expect(page.locator("text=발행일 주가")).toBeVisible();
    await expect(page.locator("text=목표가 달성")).toBeVisible();
    await expect(page.locator("text=투자의견")).toBeVisible();
  });

  test("T03-12: 로그인 페이지 로딩", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("h1:text('로그인')")).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("T03-13: 회원가입 페이지 로딩", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.locator("h1:text('회원가입')")).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("text=가입하기")).toBeVisible();
  });
});
