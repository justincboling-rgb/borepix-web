/**
 * Data model for the Borepix advanced-modality ecosystem: store products, anatomy workbooks,
 * self-quizzes, orders and community pledges. Content files in src/data must satisfy these exactly.
 */

/* ───────────────────────── Modalities ───────────────────────── */

export type Modality = "mri" | "ir" | "ct" | "mammo" | "all";

export const MODALITY_LABEL: Record<Modality, string> = {
  mri: "MRI",
  ir: "Interventional Radiology",
  ct: "CT",
  mammo: "Mammography",
  all: "All modalities",
};

export const MODALITY_SHORT: Record<Modality, string> = {
  mri: "MR",
  ir: "IR",
  ct: "CT",
  mammo: "MAMMO",
  all: "MR · IR · CT",
};

/* ───────────────────────── Store ───────────────────────── */

export type ProductCategory = "test-key" | "suite" | "ce-pass" | "app";

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  "test-key": "Test Keys",
  suite: "Complete Suites",
  "ce-pass": "CE Library Passes",
  app: "App Licenses",
};

export const PRODUCT_CATEGORIES: ProductCategory[] = ["test-key", "suite", "ce-pass", "app"];

/** Which generated artwork a product card draws. Implemented in src/components/store/product-art.tsx. */
export type ProductArt = "bore" | "vessel" | "slice" | "helix" | "shield" | "pass" | "phone";

export type ProductBadge = "bestseller" | "new" | "bundle" | "staff-pick";

export const PRODUCT_BADGE_LABEL: Record<ProductBadge, string> = {
  bestseller: "Bestseller",
  new: "New",
  bundle: "Bundle",
  "staff-pick": "Staff pick",
};

export type StockStatus = "in-stock" | "low" | "digital";

export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  /** One line under the name on cards. */
  tagline: string;
  /** Paragraphs for the product page. */
  description: string[];
  price: number;
  /** Strike-through list price when the product is a bundle or on offer. */
  compareAt?: number;
  category: ProductCategory;
  modality: Modality;
  /** CE credits awarded on a passing submission, or null when not a CE product. */
  ceCredits: number | null;
  /** Items on the test, or null when not a test key. */
  questionCount: number | null;
  /** Passing score as a percentage, or null when not a test key. */
  passMark: number | null;
  /** Attempt policy printed on the card and product page. */
  attempts: string;
  /** Average rating 0–5 in 0.1 steps and the number of ratings it is based on. */
  rating: number;
  reviewCount: number;
  stock: StockStatus;
  badge?: ProductBadge;
  /** Bullet list of what the purchase includes. */
  includes: string[];
  /** Eligible for the NRTW2026 promo (test keys only). */
  promoEligible: boolean;
  /** Prefix used when generating license keys for this product, e.g. "MRI" → BPX-MRI-XXXX-XXXX-XXXX. */
  keyPrefix: string;
  art: ProductArt;
  /** Slug of the free workbook this key assesses, if any. */
  workbookSlug?: WorkbookSlug;
};

/* ───────────────────────── Workbooks ───────────────────────── */

export type WorkbookSlug = "mri-cross-sectional-anatomy" | "vascular-ir-pathways" | "advanced-ct-protocols";

export type WorkbookModule = {
  id: string;
  title: string;
  summary: string;
  /** Learning objectives, 3–5 short lines. */
  objectives: string[];
  /** Review-guide key points, 4–8 short lines. Free to read. */
  keyPoints: string[];
  minutes: number;
};

export type DiagramHotspot = {
  id: string;
  label: string;
  /** Position as a percentage of the diagram's width and height (0–100). */
  x: number;
  y: number;
  /** One or two sentences shown when the hotspot is active. */
  note: string;
};

/** Which interactive diagram a workbook renders. Implemented in src/components/anatomy/diagrams. */
export type DiagramId = "axial-brain" | "vascular-tree" | "ct-phase-timeline";

export type Workbook = {
  slug: WorkbookSlug;
  title: string;
  modality: Modality;
  eyebrow: string;
  summary: string;
  description: string[];
  level: "Core" | "Advanced";
  modules: WorkbookModule[];
  diagram: DiagramId;
  hotspots: DiagramHotspot[];
  /** Store slug of the official test key that certifies this workbook. */
  testKeySlug: string;
  /** Quiz category whose questions preview this workbook. */
  quizCategory: QuizCategory;
};

/* ───────────────────────── Self-quizzes ───────────────────────── */

export type QuizCategory = "mri-anatomy" | "ir-vascular" | "ct-protocols";

export const QUIZ_CATEGORY_LABEL: Record<QuizCategory, string> = {
  "mri-anatomy": "MRI Cross-Sectional Anatomy",
  "ir-vascular": "Vascular IR Pathways",
  "ct-protocols": "Advanced CT Protocols",
};

export const QUIZ_CATEGORIES: QuizCategory[] = ["mri-anatomy", "ir-vascular", "ct-protocols"];

export type Difficulty = 1 | 2 | 3;

export type QuizQuestion = {
  /** Stable unique id, e.g. "qa-mri-004". Never reuse or renumber. */
  id: string;
  category: QuizCategory;
  modality: Modality;
  /** Short topic chip, e.g. "Circle of Willis". */
  topic: string;
  difficulty: Difficulty;
  stem: string;
  /** Exactly four options, plain text, no "A." prefixes. */
  choices: [string, string, string, string];
  answer: 0 | 1 | 2 | 3;
  /** Why the answer is correct, 2–4 sentences, clinically precise. */
  rationale: string;
  /** Optional one-line note per choice, same order as choices. */
  choiceNotes?: [string, string, string, string];
};

export type Quiz = {
  slug: QuizCategory;
  title: string;
  modality: Modality;
  description: string;
  /** Minutes a learner should budget. */
  minutes: number;
  workbookSlug: WorkbookSlug;
  testKeySlug: string;
};

/* ───────────────────────── Orders & keys ───────────────────────── */

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  unitPrice: number;
  qty: number;
  /** One license key per unit purchased. */
  keys: string[];
};

export type Order = {
  /** Internal id (uuid-like). */
  id: string;
  /** Human order number, e.g. BPX-20261108-4K2Q. */
  number: string;
  /** Epoch ms. */
  createdAt: number;
  email: string;
  name: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  promoCode: string | null;
  total: number;
  payment: { brand: CardBrand; last4: string };
  status: "paid";
  /** Affiliate referral code captured from ?ref= before the purchase, if any. */
  referralCode: string | null;
};

export type RedeemedKey = {
  key: string;
  productId: string;
  /** Epoch ms. */
  redeemedAt: number;
};

export type Pledge = {
  id: string;
  /** USD amount, or 0 for an item pledge made while commerce is disabled. */
  amount: number;
  cadence: "one-time" | "monthly";
  /** Epoch ms. */
  createdAt: number;
  /** Optional display name the supporter typed. */
  name: string | null;
  /** Supply-drive items pledged in kind (from community.driveItems), when no money is involved. */
  items?: string[];
};

/* ───────────────────────── Affiliate program ───────────────────────── */

export type PayoutMethod = "stripe" | "paypal";

export const PAYOUT_METHOD_LABEL: Record<PayoutMethod, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
};

export type Affiliate = {
  id: string;
  /** Referral code, e.g. JUSTIN2026. Uppercase letters and digits only. */
  code: string;
  firstName: string;
  lastName: string;
  email: string;
  payoutMethod: PayoutMethod;
  /** Stripe Connect account id or PayPal email. */
  payoutHandle: string;
  /** Epoch ms. */
  createdAt: number;
};

export type Payout = {
  id: string;
  affiliateId: string;
  amount: number;
  method: PayoutMethod;
  /** Epoch ms. */
  createdAt: number;
};
