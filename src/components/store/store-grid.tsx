"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, RotateCcw, Search, SearchX, X } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import {
  MODALITY_LABEL,
  MODALITY_SHORT,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_LABEL,
  type Product,
  type ProductCategory,
} from "@/data/types";
import { cn } from "@/lib/cn";
import { commerceEnabled } from "@/lib/site";

const SEARCH_DEBOUNCE_MS = 150;

type CategoryFilter = "all" | ProductCategory;
type ModalityFilter = "all" | "mri" | "ir" | "ct" | "mammo";
type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "reviews";

const MODALITY_FILTERS: { value: ModalityFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "mri", label: "MRI" },
  { value: "ir", label: "IR" },
  { value: "ct", label: "CT" },
  { value: "mammo", label: "Mammo" },
];

/** Price sorts exist only once commerce is live; the preview hides every price. */
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "reviews", label: "Most reviewed" },
].filter((option) => commerceEnabled || !option.value.startsWith("price")) as { value: SortKey; label: string }[];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Everything a shopper might type to find a product, lowercased once. */
function searchIndex(product: Product): string {
  return [
    product.name,
    product.tagline,
    product.sku,
    PRODUCT_CATEGORY_LABEL[product.category],
    MODALITY_LABEL[product.modality],
    MODALITY_SHORT[product.modality],
    ...product.includes,
  ]
    .join(" ")
    .toLowerCase();
}

/** Every whitespace-separated term must appear somewhere in the index. */
function matchesQuery(index: string, query: string): boolean {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => index.includes(term));
}

function compare(a: Product, b: Product, sort: SortKey): number {
  switch (sort) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "rating":
      return b.rating - a.rating || b.reviewCount - a.reviewCount;
    case "reviews":
      return b.reviewCount - a.reviewCount;
    case "featured":
      return 0;
  }
}

/** Stable sort: ties keep catalogue order, so "Featured" is the catalogue as written. */
function sortProducts(list: Product[], sort: SortKey): Product[] {
  return list
    .map((product, index) => ({ product, index }))
    .sort((a, b) => compare(a.product, b.product, sort) || a.index - b.index)
    .map((entry) => entry.product);
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-150",
        active
          ? "border-pink/60 bg-pink/10 text-fg"
          : "border-line bg-transparent text-muted hover:border-white/25 hover:bg-white/[0.04] hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

function ChipGroup({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="mb-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

/**
 * The storefront: search, category and modality chips, sort, a live result count and the product grid.
 * Filters are component state only; the URL never changes, so a shared link always opens the full store.
 */
export function StoreGrid({ products }: { products: Product[] }) {
  const uid = useId();
  const reduce = useReducedMotion();
  const searchId = `${uid}-search`;
  const sortId = `${uid}-sort`;
  const categoryId = `${uid}-category`;
  const modalityId = `${uid}-modality`;

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [modality, setModality] = useState<ModalityFilter>("all");
  const [sort, setSort] = useState<SortKey>("featured");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(id);
  }, [query]);

  const index = useMemo(() => new Map(products.map((p) => [p.id, searchIndex(p)])), [products]);

  const visible = useMemo(() => {
    const term = debouncedQuery.trim();
    const filtered = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        // A modality chip shows exact matches only; cross-modality products (suites, passes, the app) list under "All".
        (modality === "all" || p.modality === modality) &&
        (term === "" || matchesQuery(index.get(p.id) ?? "", term)),
    );
    return sortProducts(filtered, sort);
  }, [products, index, category, modality, debouncedQuery, sort]);

  const term = debouncedQuery.trim();
  const isFiltered = query !== "" || category !== "all" || modality !== "all" || sort !== "featured";
  const noun = visible.length === 1 ? "product" : "products";
  const countText =
    (visible.length === products.length ? `${visible.length} ${noun}` : `${visible.length} of ${products.length} products`) +
    (term ? ` for “${term}”` : "");

  const reset = () => {
    setQuery("");
    setDebouncedQuery("");
    setCategory("all");
    setModality("all");
    setSort("featured");
  };

  const onSortChange = (value: string) => {
    setSort(SORT_OPTIONS.find((o) => o.value === value)?.value ?? "featured");
  };

  return (
    <div className="mt-10 sm:mt-12">
      <div role="search" aria-label="Store" className="hairline rounded-2xl bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="relative flex-1">
            <label htmlFor={searchId} className="sr-only">
              Search the store
            </label>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-silver"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search test keys, suites, passes"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              className="min-h-11 w-full rounded-xl border border-line bg-ink pl-11 pr-12 text-[0.95rem] text-fg transition-colors duration-150 placeholder:text-subtle hover:border-white/25 focus:border-white/25 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-xl text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg"
              >
                <X className="size-4" strokeWidth={1.75} aria-hidden />
              </button>
            ) : null}
          </div>

          <div className="lg:w-64">
            <label htmlFor={sortId} className="mb-2 block font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted">
              Sort by
            </label>
            <div className="relative">
              <select
                id={sortId}
                value={sort}
                onChange={(e) => onSortChange(e.target.value)}
                className="min-h-11 w-full appearance-none rounded-xl border border-line bg-ink pl-4 pr-10 text-[0.95rem] text-fg transition-colors duration-150 hover:border-white/25 focus:border-white/25"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-silver"
                strokeWidth={1.75}
                aria-hidden
              />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 border-t border-white/8 pt-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
          <ChipGroup id={categoryId} label="Category">
            <Chip active={category === "all"} onClick={() => setCategory("all")}>
              All
            </Chip>
            {PRODUCT_CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {PRODUCT_CATEGORY_LABEL[c]}
              </Chip>
            ))}
          </ChipGroup>

          <ChipGroup id={modalityId} label="Modality">
            {MODALITY_FILTERS.map((m) => (
              <Chip key={m.value} active={modality === m.value} onClick={() => setModality(m.value)}>
                {m.label}
              </Chip>
            ))}
          </ChipGroup>
        </div>
      </div>

      <div className="mt-8 flex min-h-10 flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <p role="status" aria-live="polite" aria-atomic="true" className="num text-sm text-muted">
          {countText}
        </p>
        {isFiltered ? (
          <Button variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
            Reset filters
          </Button>
        ) : null}
      </div>

      <h2 className="sr-only">Products</h2>

      {visible.length > 0 ? (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((product, i) => (
            <motion.li
              key={product.id}
              layout={reduce ? false : "position"}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                ease: EASE,
                delay: Math.min(i, 6) * 0.05,
                layout: { duration: 0.45, ease: EASE, delay: 0 },
              }}
              className="min-w-0"
            >
              <ProductCard product={product} />
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="hairline mt-4 flex flex-col items-center rounded-2xl bg-card px-6 py-16 text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-full border border-line bg-ink-2 text-silver">
            <SearchX className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <p className="mt-5 font-display text-xl font-semibold text-fg">No products match.</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
            Try a shorter term, or clear the filters to see all {products.length} products in the catalogue.
          </p>
          <Button variant="secondary" onClick={reset} className="mt-6">
            <RotateCcw className="size-4" strokeWidth={1.75} aria-hidden />
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
