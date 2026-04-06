import { test, expect } from "@playwright/test";

test.describe("T04: Frontend 인터랙션 시험", () => {
  test("T04-1: 헤더 네비게이션 - 랭킹 링크", async ({ page }) => {
    await page.goto("/");
    await page.click("header >> text=랭킹");
    await expect(page).toHaveURL(/\/rankings/);
    await expect(page.locator("h1:text('애널리스트 랭킹')")).toBeVisible();
  });

  test("T04-2: 헤더 네비게이션 - 애널리스트 링크", async ({ page }) => {
    await page.goto("/");
    await page.click("header >> text=애널리스트");
    await expect(page).toHaveURL(/\/analysts/);
  });

  test("T04-3: 헤더 네비게이션 - 종목 링크", async ({ page }) => {
    await page.goto("/");
    await page.click("header >> text=종목");
    await expect(page).toHaveURL(/\/stocks/);
  });

  test("T04-4: 헤더 네비게이션 - 리포트 링크", async ({ page }) => {
    await page.goto("/");
    await page.click("header >> text=리포트");
    await expect(page).toHaveURL(/\/reports/);
  });

  test("T04-5: 헤더 네비게이션 - 커뮤니티 링크", async ({ page }) => {
    await page.goto("/");
    await page.click("header >> text=커뮤니티");
    await expect(page).toHaveURL(/\/boards/);
  });

  test("T04-6: 메인 페이지 - 랭킹 보기 버튼", async ({ page }) => {
    await page.goto("/");
    await page.click("text=랭킹 보기");
    await expect(page).toHaveURL(/\/rankings/);
  });

  test("T04-7: 메인 페이지 - 리포트 검색 버튼", async ({ page }) => {
    await page.goto("/");
    await page.click("text=리포트 검색");
    await expect(page).toHaveURL(/\/reports/);
  });

  test("T04-8: 메인 페이지 - 무료로 시작하기 버튼", async ({ page }) => {
    await page.goto("/");
    await page.click("text=무료로 시작하기");
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("T04-9: 헤더 - 로그인 버튼", async ({ page }) => {
    await page.goto("/");
    await page.click("header >> text=로그인");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("T04-10: 로그인 페이지 - 회원가입 링크", async ({ page }) => {
    await page.goto("/auth/login");
    await page.click("text=회원가입");
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test("T04-11: 회원가입 페이지 - 로그인 링크", async ({ page }) => {
    await page.goto("/auth/register");
    await page.click("a:text('로그인')");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("T04-12: 랭킹 페이지 - 기간 선택 변경", async ({ page }) => {
    await page.goto("/rankings");
    await page.click("button:text('3개월')");
    // 3개월 버튼이 활성화 상태인지 확인 (배경색 변경)
    const btn = page.locator("button:text('3개월')");
    await expect(btn).toHaveClass(/bg-white/);
  });

  test("T04-13: 애널리스트 목록 - 검색 필터", async ({ page }) => {
    await page.goto("/analysts");
    await page.fill("input[placeholder*='검색']", "김서연");
    await expect(page.locator("text=김서연")).toBeVisible();
  });

  test("T04-14: 애널리스트 목록 - 증권사 필터", async ({ page }) => {
    await page.goto("/analysts");
    await page.click("button:text('삼성증권')");
    await expect(page.locator("text=박준혁")).toBeVisible();
  });

  test("T04-15: 리포트 페이지 - 의견 필터", async ({ page }) => {
    await page.goto("/reports");
    await page.click("button:text('매도')");
    await expect(page.locator("text=LG화학")).toBeVisible();
  });

  test("T04-16: 게시판 - 글쓰기 폼 토글", async ({ page }) => {
    await page.goto("/boards/general");
    await page.click("button:text('글쓰기')");
    await expect(page.locator("input[placeholder='제목을 입력하세요']")).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
    // 취소 버튼
    await page.click("button:text('취소')");
    await expect(page.locator("input[placeholder='제목을 입력하세요']")).not.toBeVisible();
  });

  test("T04-17: 종목 페이지 - 섹터 필터", async ({ page }) => {
    await page.goto("/stocks");
    await page.click("button:text('헬스케어')");
    await expect(page.locator("text=셀트리온")).toBeVisible();
  });

  test("T04-18: 종목 상세 - 애널리스트 신뢰도 테두리 표시", async ({ page }) => {
    await page.goto("/stocks/005930");
    // 신뢰도 설명 텍스트
    await expect(page.locator("text=아이콘 테두리 색상은 애널리스트 신뢰도를 나타냅니다")).toBeVisible();
    // 애널리스트 의견 목록
    await expect(page.locator("text=김서연")).toBeVisible();
  });
});
