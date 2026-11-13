import Link from "next/link";
import { legalHref, legalPages, type LegalSlug } from "@/lib/site";

export const legalLinkClass =
  "font-medium text-blush underline decoration-blush/40 underline-offset-4 transition-colors duration-150 hover:decoration-blush";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const SLUG_BY_TITLE = new Map<string, LegalSlug>(legalPages.map((page) => [page.title, page.slug]));

// One capturing group so String.split() keeps the matches at odd indexes. Inner groups must stay non-capturing.
const TOKEN = new RegExp(
  "(" +
    [
      ...legalPages.map((page) => escapeRegExp(page.title)),
      "`[^`]+`",
      "https?://[^\\s]*[^\\s.,;:!?)]",
      "[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)*\\.[A-Za-z]{2,}",
    ].join("|") +
    ")",
);

/**
 * Renders a plain-text legal string with inline links: other legal documents by exact title,
 * email addresses, https URLs, and `code` spans. The current document's own title stays plain text.
 */
export function LegalText({ text, current }: { text: string; current: LegalSlug }) {
  const parts = text.split(TOKEN);

  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) return part;

        const slug = SLUG_BY_TITLE.get(part);
        if (slug) {
          return slug === current ? (
            part
          ) : (
            <Link key={i} href={legalHref(slug)} className={legalLinkClass}>
              {part}
            </Link>
          );
        }

        if (part.startsWith("`")) {
          return (
            <code key={i} className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[0.85em] text-fg">
              {part.slice(1, -1)}
            </code>
          );
        }

        if (/^https?:\/\//.test(part)) {
          return (
            <a key={i} href={part} className={legalLinkClass}>
              {part.replace(/^https?:\/\//, "")}
            </a>
          );
        }

        return (
          <a key={i} href={`mailto:${part}`} className={legalLinkClass}>
            {part}
          </a>
        );
      })}
    </>
  );
}
