import { test, expect } from "@playwright/test";

test.describe("T06: Sprint 5 - Frontend API 연동 시험", () => {
  test("T06-1: 메인 대시보드 - 랭킹 API 데이터 렌더링", async ({ page }) => {
    await page.goto("/");
    // Stats section should show real counts (not "-")
    await page.waitForTimeout(3000);
    const statsSection = page.locator("section").filter({ hasText: "평가 애널리스트" });
    // After API loads, should show a number
    await expect(statsSection.locator("div.text-display-sm, div.text-display").first()).not.toHaveText("-", { timeout: 10000 });
  });

  test("T06-2: 메인 대시보드 - 리포트 API 데이터 렌더링", async ({ page }) => {
    await page.goto("/");
    // Latest reports section should show real report cards
    await expect(page.locator("text=목표가").first()).toBeVisible({ timeout: 10000 });
    // Should have opinion badges
    await expect(page.locator(".bg-accent-green\\/10, .bg-accent-orange\\/10, .bg-accent-red\\/10").first()).toBeVisible();
  });

  test("T06-3: 랭킹 페이지 - API 데이터 + 기간 전환", async ({ page }) => {
    await page.goto("/rankings");
    // Wait for ranking table to load
    await expect(page.locator("text=순위").first()).toBeVisible({ timeout: 10000 });
    // Should show ranking entries with score bars
    await expect(page.locator(".bg-accent-blue\\/80").first()).toBeVisible();
    // Switch to 3m period
    await page.click("button:text('3개월')");
    // Should reload data (may show different or same data)
    await page.waitForTimeout(2000);
    await expect(page.locator("h1:text('애널리스트 랭킹')")).toBeVisible();
  });

  test("T06-4: 애널리스트 상세 - API 데이터 로딩", async ({ page }) => {
    await page.goto("/analysts/1");
    // Should load analyst name from API
    await expect(page.locator("h1")).toBeVisible({ timeout: 10000 });
    // Score breakdown cards
    await expect(page.locator("text=목표가 달성률")).toBeVisible();
    // Stats row
    await expect(page.locator("text=총 리포트")).toBeVisible();
    await expect(page.locator("text=적중률")).toBeVisible();
  });

  test("T06-5: 종목 상세 - Consensus API 데이터", async ({ page }) => {
    await page.goto("/stocks/005930");
    await expect(page.getByRole("heading", { name: "삼성전자" })).toBeVisible({ timeout: 10000 });
    // Consensus data from API
    await expect(page.locator("text=투자의견 분포")).toBeVisible();
    // Buy count should be visible (green bar)
    await expect(page.locator(".bg-accent-green").first()).toBeVisible();
    // Target price range
    await expect(page.locator("text=평균")).toBeVisible();
  });

  test("T06-6: 리포트 페이지 - 페이지네이션", async ({ page }) => {
    await page.goto("/reports");
    // Wait for data
    await expect(page.locator("text=목표가").first()).toBeVisible({ timeout: 10000 });
    // Should show pagination if total > 20
    const pagination = page.locator("text=/\\d+ \\/ \\d+/");
    if (await pagination.isVisible()) {
      // Click next page
      await page.click("button:text('다음')");
      await page.waitForTimeout(1000);
      await expect(page.locator("text=목표가").first()).toBeVisible();
    }
  });

  test("T06-7: 종목 페이지 - 검색 필터 API 연동", async ({ page }) => {
    await page.goto("/stocks");
    await expect(page.locator("text=삼성전자")).toBeVisible({ timeout: 10000 });
    // Type search query
    await page.fill("input[placeholder*='검색']", "SK");
    await page.waitForTimeout(1500);
    // Should show SK stocks
    await expect(page.locator("text=SK하이닉스")).toBeVisible({ timeout: 10000 });
  });

  test("T06-8: 게시판 - 보드 탭 API 연동", async ({ page }) => {
    await page.goto("/boards/general");
    // Board tabs should load from API - check the tab area (not header link)
    await expect(page.locator("button:text('글쓰기')")).toBeVisible({ timeout: 10000 });
    // Should have multiple board tab links in the tab bar area
    const boardTabs = page.locator("a[href^='/boards/']").filter({ hasNot: page.locator("header a") });
    await expect(boardTabs.first()).toBeVisible();
  });

  test("T06-9: Backend consensus API 정상 응답", async ({ request }) => {
    const response = await request.get("http://localhost:8000/api/v1/stocks/1/consensus");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("stock");
    expect(data).toHaveProperty("buy_count");
    expect(data).toHaveProperty("hold_count");
    expect(data).toHaveProperty("sell_count");
    expect(data).toHaveProperty("avg_target_price");
    expect(data).toHaveProperty("high_target_price");
    expect(data).toHaveProperty("low_target_price");
    expect(data).toHaveProperty("report_count");
  });

  test("T06-10: Backend reports 검색 API 동작", async ({ request }) => {
    const response = await request.get("http://localhost:8000/api/v1/reports?search=%EC%82%BC%EC%84%B1");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.items.length).toBeGreaterThan(0);
    // All results should contain 삼성
    for (const item of data.items) {
      const hasMatch = item.stock_name?.includes("삼성") || item.analyst_name?.includes("삼성");
      expect(hasMatch).toBeTruthy();
    }
  });
});
