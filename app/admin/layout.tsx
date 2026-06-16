import type { ReactNode } from "react";
import Link from "next/link";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <strong>Admin</strong>
        <Link href="/admin/attempts">시도 기록</Link>
        <Link href="/admin/grading">채점 대기</Link>
        <Link href="/exam">시험 보러 가기</Link>
        <Link href="/">홈</Link>
      </nav>
      {children}
    </div>
  );
}
