import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { resolveDocHref } from "@/lib/content";

interface MarkdownArticleProps {
  sourcePath: string;
  body: string;
}

export function MarkdownArticle({ sourcePath, body }: MarkdownArticleProps) {
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
        }
      }}
    >
      {body}
    </ReactMarkdown>
  );
}
