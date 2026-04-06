import Link from "next/link";

// Demo data for initial rendering before backend is connected
const topAnalysts = [
  { id: 1, name: "김서연", firm: "미래에셋증권", score: 87.3, sector: "반도체", reports: 48 },
  { id: 2, name: "박준혁", firm: "삼성증권", score: 82.1, sector: "헬스케어", reports: 35 },
  { id: 3, name: "이수진", firm: "KB증권", score: 79.8, sector: "금융", reports: 42 },
  { id: 4, name: "정민우", firm: "한국투자증권", score: 76.5, sector: "IT", reports: 31 },
  { id: 5, name: "최하영", firm: "대신증권", score: 74.2, sector: "자동차", reports: 27 },
];

const latestReports = [
  { id: 1, analyst: "김서연", firm: "미래에셋", stock: "삼성전자", opinion: "매수" as const, targetPrice: 95000, date: "2026-04-05" },
  { id: 2, analyst: "박준혁", firm: "삼성증권", stock: "셀트리온", opinion: "매수" as const, targetPrice: 280000, date: "2026-04-05" },
  { id: 3, analyst: "이수진", firm: "KB증권", stock: "카카오뱅크", opinion: "중립" as const, targetPrice: 32000, date: "2026-04-04" },
  { id: 4, analyst: "정민우", firm: "한투증권", stock: "네이버", opinion: "매수" as const, targetPrice: 320000, date: "2026-04-04" },
];

function getTrustRing(score: number) {
  if (score >= 80) return "ring-trust-top";
  if (score >= 60) return "ring-trust-high";
  if (score >= 40) return "ring-trust-mid";
  return "ring-trust-low";
}

function opinionStyle(opinion: string) {
  if (opinion === "매수") return "bg-accent-green/10 text-accent-green";
  if (opinion === "매도") return "bg-accent-red/10 text-accent-red";
  return "bg-accent-orange/10 text-accent-orange";
}

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="py-24 md:py-32">
        <div className="container-tight text-center">
          <h1 className="text-display-sm md:text-display lg:text-display-lg text-text-primary mb-6 animate-fade-in">
            누가 진짜 잘 맞추는지,<br />
            데이터가 말해줍니다.
          </h1>
          <p className="text-body-lg md:text-title text-text-secondary max-w-2xl mx-auto mb-10 animate-slide-up font-normal">
            국내 증권사 애널리스트의 목표가와 투자의견을<br className="hidden md:block" />
            실제 주가와 비교하여 정량 평가합니다.
          </p>
          <div className="flex items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/rankings"
              className="rounded-full bg-text-primary px-7 py-3 text-body-lg text-white hover:bg-text-secondary transition-colors"
            >
              랭킹 보기
            </Link>
            <Link
              href="/reports"
              className="rounded-full bg-surface-secondary px-7 py-3 text-body-lg text-text-primary hover:bg-border-secondary transition-colors"
            >
              리포트 검색
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-surface-secondary">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "496", label: "평가 애널리스트" },
              { value: "27", label: "증권사" },
              { value: "11", label: "GICS 섹터" },
              { value: "100%", label: "정량 평가" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-display-sm md:text-display text-text-primary">{stat.value}</div>
                <div className="text-body text-text-tertiary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Analysts */}
      <section className="py-20">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-headline text-text-primary">Top 애널리스트</h2>
              <p className="text-body text-text-tertiary mt-1">최근 12개월 기준 종합 랭킹</p>
            </div>
            <Link href="/rankings" className="text-body text-accent-blue hover:text-accent-blue-hover transition-colors">
              전체 보기 &rarr;
            </Link>
          </div>

          <div className="grid gap-3">
            {topAnalysts.map((analyst, i) => (
              <Link
                key={analyst.id}
                href={`/analysts/${analyst.id}`}
                className="group flex items-center gap-5 p-4 rounded-apple-lg hover:bg-surface-secondary transition-colors"
              >
                <span className="text-title text-text-tertiary w-8 text-right">{i + 1}</span>
                <div
                  className={`w-11 h-11 rounded-full bg-surface-secondary flex items-center justify-center ring-[3px] ring-offset-2 ring-offset-white ${getTrustRing(analyst.score)}`}
                >
                  <span className="text-body font-semibold text-text-secondary">
                    {analyst.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body-lg font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                      {analyst.name}
                    </span>
                    <span className="text-body text-text-tertiary">{analyst.firm}</span>
                  </div>
                  <div className="text-caption text-text-tertiary mt-0.5">
                    {analyst.sector} &middot; 리포트 {analyst.reports}건
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-title text-text-primary">{analyst.score.toFixed(1)}</div>
                  <div className="text-caption text-text-tertiary">점</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Reports */}
      <section className="py-20 bg-surface-secondary">
        <div className="container-wide">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-headline text-text-primary">최신 리포트</h2>
              <p className="text-body text-text-tertiary mt-1">오늘 발행된 애널리스트 리포트</p>
            </div>
            <Link href="/reports" className="text-body text-accent-blue hover:text-accent-blue-hover transition-colors">
              전체 보기 &rarr;
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {latestReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-apple-lg p-5 shadow-apple hover:shadow-apple-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-body-lg font-semibold text-text-primary">{report.stock}</span>
                    <span className="text-body text-text-tertiary ml-2">{report.date}</span>
                  </div>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-caption font-semibold ${opinionStyle(report.opinion)}`}>
                    {report.opinion}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-body text-text-secondary">{report.analyst} &middot; {report.firm}</span>
                  <span className="text-body font-semibold text-text-primary">
                    목표가 {report.targetPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container-tight text-center">
          <h2 className="text-display-sm text-text-primary mb-4">
            투자 판단의 새로운 기준
          </h2>
          <p className="text-body-lg text-text-secondary mb-8 max-w-lg mx-auto">
            회원가입 후 커뮤니티에서 다른 투자자들과 애널리스트 리포트에 대한 의견을 나눠보세요.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex rounded-full bg-accent-blue px-7 py-3 text-body-lg text-white hover:bg-accent-blue-hover transition-colors"
          >
            무료로 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
