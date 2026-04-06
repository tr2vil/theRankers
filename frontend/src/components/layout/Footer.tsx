import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border-secondary bg-surface-secondary">
      <div className="container-wide py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-body font-semibold text-text-primary mb-3">서비스</h4>
            <div className="flex flex-col gap-2">
              <Link href="/rankings" className="text-body text-text-tertiary hover:text-text-primary transition-colors">랭킹</Link>
              <Link href="/analysts" className="text-body text-text-tertiary hover:text-text-primary transition-colors">애널리스트</Link>
              <Link href="/stocks" className="text-body text-text-tertiary hover:text-text-primary transition-colors">종목</Link>
              <Link href="/reports" className="text-body text-text-tertiary hover:text-text-primary transition-colors">리포트</Link>
            </div>
          </div>
          <div>
            <h4 className="text-body font-semibold text-text-primary mb-3">커뮤니티</h4>
            <div className="flex flex-col gap-2">
              <Link href="/boards/general" className="text-body text-text-tertiary hover:text-text-primary transition-colors">자유게시판</Link>
              <Link href="/boards" className="text-body text-text-tertiary hover:text-text-primary transition-colors">종목토론</Link>
            </div>
          </div>
          <div>
            <h4 className="text-body font-semibold text-text-primary mb-3">정보</h4>
            <div className="flex flex-col gap-2">
              <span className="text-body text-text-tertiary">평가 방법론</span>
              <span className="text-body text-text-tertiary">이용약관</span>
              <span className="text-body text-text-tertiary">개인정보처리방침</span>
            </div>
          </div>
          <div>
            <h4 className="text-body font-semibold text-text-primary mb-3">theRankers</h4>
            <p className="text-body text-text-tertiary">
              데이터 기반 애널리스트 평가로<br />
              투자 판단의 새로운 기준을 제시합니다.
            </p>
          </div>
        </div>
        <div className="section-divider pt-6">
          <p className="text-caption text-text-tertiary">
            &copy; 2026 theRankers. 투자 판단은 본인의 책임이며, 본 서비스는 참고 자료만을 제공합니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
