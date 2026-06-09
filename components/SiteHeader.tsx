import Link from "next/link";
import { BookOpen, GraduationCap, ListChecks, PenLine } from "lucide-react";

const NAV_ITEMS = [
  { href: "/topics", label: "지식 베이스", icon: BookOpen },
  { href: "/questions", label: "질문 뱅크", icon: ListChecks },
  { href: "/exam", label: "모의고사", icon: PenLine }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="iOS Interview 홈">
        <span className="brand-mark">
          <GraduationCap size={20} aria-hidden="true" />
        </span>
        <span>
          <strong>iOS Interview</strong>
          <small>Swift 면접 학습 도구</small>
        </span>
      </Link>
      <nav className="nav-links" aria-label="주요 메뉴">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="nav-link">
              <Icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
