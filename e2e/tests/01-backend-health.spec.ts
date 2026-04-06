import { test, expect } from "@playwright/test";

test.describe("T01: Backend API 헬스체크", () => {
  test("T01-1: /health 엔드포인트 응답 확인", async ({ request }) => {
    const res = await request.get("http://localhost:8000/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.service).toBe("theRankers");
  });

  test("T01-2: /docs (Swagger) 접근 확인", async ({ request }) => {
    const res = await request.get("http://localhost:8000/docs");
    expect(res.status()).toBe(200);
  });

  test("T01-3: /api/v1/analysts 엔드포인트 응답 확인", async ({ request }) => {
    const res = await request.get("http://localhost:8000/api/v1/analysts");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("items");
    expect(body).toHaveProperty("total");
  });

  test("T01-4: /api/v1/rankings 엔드포인트 응답 확인", async ({ request }) => {
    const res = await request.get("http://localhost:8000/api/v1/rankings?period=12m");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("period", "12m");
    expect(body).toHaveProperty("items");
  });

  test("T01-5: /api/v1/stocks 엔드포인트 응답 확인", async ({ request }) => {
    const res = await request.get("http://localhost:8000/api/v1/stocks");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("items");
  });

  test("T01-6: /api/v1/reports 엔드포인트 응답 확인", async ({ request }) => {
    const res = await request.get("http://localhost:8000/api/v1/reports");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("items");
  });

  test("T01-7: /api/v1/boards 엔드포인트 응답 확인", async ({ request }) => {
    const res = await request.get("http://localhost:8000/api/v1/boards");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });
});
