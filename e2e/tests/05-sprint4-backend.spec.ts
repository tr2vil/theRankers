import { test, expect } from "@playwright/test";

const API = "http://localhost:8000";

test.describe("T05: Sprint 4 Backend 기능 시험", () => {
  test("T05-1: /api/v1/analysts 실제 데이터 존재 확인", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/analysts`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    expect(body.items.length).toBeGreaterThan(0);
    // 애널리스트 필드 구조 검증
    const analyst = body.items[0];
    expect(analyst).toHaveProperty("name");
    expect(analyst).toHaveProperty("firm");
    expect(analyst).toHaveProperty("ranking_score");
    expect(analyst).toHaveProperty("total_reports");
  });

  test("T05-2: /api/v1/rankings?period=12m 실제 랭킹 데이터 확인", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/rankings?period=12m`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.period).toBe("12m");
    expect(body.items.length).toBeGreaterThan(0);
    // 랭킹 점수 분해 필드 확인
    const entry = body.items[0];
    expect(entry.rank).toBe(1);
    expect(entry.score).toBeGreaterThan(0);
    expect(entry).toHaveProperty("target_hit_score");
    expect(entry).toHaveProperty("excess_return_score");
    expect(entry).toHaveProperty("direction_accuracy_score");
    expect(entry).toHaveProperty("consistency_score");
  });

  test("T05-3: /api/v1/rankings 기간별 필터 (1m, 3m, 6m, 12m)", async ({ request }) => {
    for (const period of ["1m", "3m", "6m", "12m"]) {
      const res = await request.get(`${API}/api/v1/rankings?period=${period}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.period).toBe(period);
    }
  });

  test("T05-4: /api/v1/stocks 실제 종목 데이터 확인", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/stocks`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    const stock = body.items[0];
    expect(stock).toHaveProperty("code");
    expect(stock).toHaveProperty("name");
    expect(stock).toHaveProperty("gics_sector");
  });

  test("T05-5: /api/v1/reports 실제 리포트 데이터 확인", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/reports`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.total).toBeGreaterThan(0);
    const report = body.items[0];
    expect(report).toHaveProperty("opinion");
    expect(report).toHaveProperty("target_price");
    expect(report).toHaveProperty("report_date");
    expect(report).toHaveProperty("analyst_name");
    expect(report).toHaveProperty("stock_name");
  });

  test("T05-6: /api/v1/boards 게시판 데이터 확인", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/boards`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
    const board = body[0];
    expect(board).toHaveProperty("slug");
    expect(board).toHaveProperty("name");
    expect(board).toHaveProperty("board_type");
  });

  test("T05-7: /api/v1/analysts 증권사 필터 동작", async ({ request }) => {
    // 먼저 전체 조회로 증권사명 확인
    const allRes = await request.get(`${API}/api/v1/analysts?size=1`);
    const allBody = await allRes.json();
    if (allBody.items.length > 0) {
      const firm = allBody.items[0].firm;
      const res = await request.get(`${API}/api/v1/analysts?firm=${encodeURIComponent(firm)}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      // 필터된 결과는 모두 같은 증권사
      for (const a of body.items) {
        expect(a.firm).toBe(firm);
      }
    }
  });

  test("T05-8: /api/v1/reports 투자의견 필터 동작", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/reports?opinion=${encodeURIComponent("매수")}`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    for (const r of body.items) {
      expect(r.opinion).toBe("매수");
    }
  });

  test("T05-9: 랭킹 순서 정합성 (rank 오름차순, score 내림차순)", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/rankings?period=12m`);
    const body = await res.json();
    for (let i = 1; i < body.items.length; i++) {
      expect(body.items[i].rank).toBeGreaterThanOrEqual(body.items[i - 1].rank);
      expect(body.items[i].score).toBeLessThanOrEqual(body.items[i - 1].score);
    }
  });

  test("T05-10: 스코어 합산 정합성 (4개 지표 합 = total score)", async ({ request }) => {
    const res = await request.get(`${API}/api/v1/rankings?period=12m`);
    const body = await res.json();
    for (const entry of body.items) {
      const sum = entry.target_hit_score + entry.excess_return_score +
                  entry.direction_accuracy_score + entry.consistency_score;
      expect(Math.abs(entry.score - sum)).toBeLessThan(0.1);
    }
  });
});
