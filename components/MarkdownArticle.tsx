import Link from "next/link";
import { Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveDocHref } from "@/lib/content";

interface MarkdownArticleProps {
  sourcePath: string;
  body: string;
  progressBySlug?: Map<string, number>;
}

type HastNode = {
  type?: string;
  tagName?: string;
  properties?: { href?: string };
  children?: HastNode[];
};

function findFirstLinkHref(node: HastNode | undefined): string | undefined {
  if (!node?.children) return undefined;
  for (const child of node.children) {
    if (child.tagName === "a" && typeof child.properties?.href === "string") {
      return child.properties.href;
    }
    const nested = findFirstLinkHref(child);
    if (nested) return nested;
  }
  return undefined;
}

export function MarkdownArticle({ sourcePath, body, progressBySlug }: MarkdownArticleProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href = "", children }) => {
          const resolvedHref = resolveDocHref(sourcePath, href);
          const isInternal = resolvedHref.startsWith("/");

          if (isInternal) {
            return <Link href={resolvedHref}>{children}</Link>;
          }

          return (
            <a href={resolvedHref} target="_blank" rel="noreferrer">
              {children}
            </a>
          );
        },
        li: ({ node, children, ...rest }) => {
          const href = findFirstLinkHref(node as HastNode);
          if (!href) return <li {...rest}>{children}</li>;

          const resolved = resolveDocHref(sourcePath, href);
          if (!resolved.startsWith("/topics/")) {
            return <li {...rest}>{children}</li>;
          }

          const slug = resolved.replace(/^\/topics\//, "").split("#")[0];
          const studied = progressBySlug?.has(slug) ?? false;

          return (
            <li className={`topic-li ${studied ? "topic-li-studied" : "topic-li-unstudied"}`}>
              <span className="topic-li-icon" aria-hidden="true">
                {studied ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
              </span>
              <span className="topic-li-content">{children}</span>
              <span className="sr-only">{studied ? "학습함" : "미학습"}</span>
            </li>
          );
        }
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
