import { BookOpen, Info, KeyRound, MapPin, type LucideIcon } from "lucide-react";
import { ProductArt } from "@/components/store/product-art";
import { Badge } from "@/components/ui/badge";
import { release, site } from "@/lib/site";

const VALUES: { Icon: LucideIcon; text: string }[] = [
  { Icon: BookOpen, text: "Free workbooks and self-quizzes for MRI, IR and CT." },
  { Icon: KeyRound, text: "Official CE test keys and CE Library passes at launch." },
  { Icon: MapPin, text: `Built in ${site.hq.city}, ${site.hq.state} by Radiologic Technologists.` },
];

/**
 * Brand half of the auth card. From lg it is the left column: wordmark and motto, the bore artwork, three
 * value lines and the release notice. Below lg it collapses to a slim strip above the form.
 */
export function BrandPanel() {
  return (
    <div className="relative isolate overflow-hidden border-b border-line bg-ink-2 lg:flex lg:flex-col lg:border-r lg:border-b-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-radial-[at_25%_10%] from-pink/20 via-pink/[0.04] via-45% to-transparent"
      />
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-50" />

      <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:block lg:px-10 lg:pt-10 lg:pb-0">
        <p className="flex flex-col leading-none">
          <span className="font-display text-xl font-semibold tracking-tight text-fg lowercase lg:text-4xl">borepix</span>
          <span className="mt-1.5 text-[0.6875rem] font-bold tracking-[0.04em] text-zinc-300 lg:mt-3 lg:text-base">
            {site.motto}
          </span>
        </p>
        <Badge className="lg:hidden">{release.label}</Badge>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:px-10 lg:py-6">
        <div className="mx-auto aspect-[4/3] w-full max-w-[20rem]">
          <ProductArt variant="bore" />
        </div>
      </div>

      <div className="hidden lg:block lg:px-10 lg:pb-10">
        <ul className="space-y-3.5">
          {VALUES.map(({ Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-silver">
              <Icon aria-hidden strokeWidth={1.75} className="mt-0.5 size-4 shrink-0 text-blush" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 flex items-start gap-2 border-t border-white/8 pt-5 font-mono text-xs leading-relaxed tracking-[0.04em] text-muted">
          <Info aria-hidden strokeWidth={1.75} className="mt-px size-3.5 shrink-0" />
          {release.short}
        </p>
      </div>
    </div>
  );
}
