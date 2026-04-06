import { test, expect } from "@playwright/test";

const API = "http://localhost:8000/api/v1/auth";
const testUser = {
  email: `test_${Date.now()}@example.com`,
  username: `tester_${Date.now()}`,
  password: "testpass1234",
};

let accessToken: string;
let refreshToken: string;

test.describe("T02: Auth API 기능 시험", () => {
  test("T02-1: 회원가입 성공", async ({ request }) => {
    const res = await request.post(`${API}/register`, { data: testUser });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("refresh_token");
    expect(body.token_type).toBe("bearer");
    accessToken = body.access_token;
    refreshToken = body.refresh_token;
  });

  test("T02-2: 중복 이메일 회원가입 거부", async ({ request }) => {
    const res = await request.post(`${API}/register`, { data: testUser });
    expect(res.status()).toBe(409);
  });

  test("T02-3: 로그인 성공", async ({ request }) => {
    const res = await request.post(`${API}/login`, {
      data: { email: testUser.email, password: testUser.password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("access_token");
    accessToken = body.access_token;
    refreshToken = body.refresh_token;
  });

  test("T02-4: 잘못된 비밀번호 로그인 거부", async ({ request }) => {
    const res = await request.post(`${API}/login`, {
      data: { email: testUser.email, password: "wrongpassword" },
    });
    expect(res.status()).toBe(401);
  });

  test("T02-5: 토큰으로 내 정보 조회", async ({ request }) => {
    const res = await request.get(`${API}/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.email).toBe(testUser.email);
    expect(body.username).toBe(testUser.username);
  });

  test("T02-6: 토큰 없이 내 정보 조회 거부", async ({ request }) => {
    const res = await request.get(`${API}/me`);
    expect(res.status()).toBe(403);
  });

  test("T02-7: 토큰 갱신", async ({ request }) => {
    const res = await request.post(`${API}/refresh`, {
      data: { refresh_token: refreshToken },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("access_token");
    expect(body).toHaveProperty("refresh_token");
  });
});
