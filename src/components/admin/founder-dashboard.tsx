"use client";

import { useState } from "react";
import { Download, HeartHandshake, KeyRound, Receipt, Users, Wallet, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PAYOUT_METHOD_LABEL } from "@/data/types";
import { cents, formatPrice } from "@/lib/pricing";
import { affiliateProgram, site } from "@/lib/site";
import { affiliateStats, useAffiliates } from "@/lib/store/affiliates";
import { useHydrated } from "@/lib/store/cart";
import { pledgeSummary, useOrders } from "@/lib/store/orders";

const dateFmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Founder control center: revenue, keys, pledges and affiliate payouts computed from this device's data. */
export function FounderDashboard() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const pledges = useOrders((s) => s.pledges);
  const affiliates = useAffiliates((s) => s.affiliates);
  const payouts = useAffiliates((s) => s.payouts);
  const recordPayout = useAffiliates((s) => s.recordPayout);
  const [lastPayout, setLastPayout] = useState<string | null>(null);

  if (!hydrated) return <div className="panel min-h-[24rem] rounded-2xl" aria-busy="true" aria-label="Loading dashboard" />;

  const revenue = cents(orders.reduce((n, o) => n + o.total, 0));
  const keysSold = orders.reduce((n, o) => n + o.items.reduce((m, i) => m + i.keys.length, 0), 0);
  const rows = affiliates.map((a) => ({ affiliate: a, stats: affiliateStats(a, orders, payouts) }));
  const payoutsDue = cents(rows.reduce((n, r) => n + r.stats.due, 0));
  const pledgeTotals = pledgeSummary(pledges);

  const kpis: { icon: LucideIcon; label: string; value: string; note: string }[] = [
    { icon: Receipt, label: "Revenue", value: formatPrice(revenue), note: `${orders.length} ${orders.length === 1 ? "order" : "orders"}` },
    { icon: KeyRound, label: "Keys issued", value: String(keysSold), note: "test keys, suites, passes and licenses" },
    { icon: Wallet, label: "Affiliate payouts due", value: formatPrice(payoutsDue), note: `${affiliates.length} ${affiliates.length === 1 ? "partner" : "partners"}` },
    {
      icon: HeartHandshake,
      label: "Shelter pledges",
      value: formatPrice(pledgeTotals.oneTime + pledgeTotals.monthly),
      note: `${pledgeTotals.count} ${pledgeTotals.count === 1 ? "pledge" : "pledges"}${pledgeTotals.monthly ? `, ${formatPrice(pledgeTotals.monthly)} monthly` : ""}`,
    },
  ];

  function exportCsv() {
    const header = ["Partner", "Email", "Code", "Method", "Payout account", "Attributed orders", "Earned", "Paid", "Due"];
    const lines = rows.map((r) =>
      [
        `${r.affiliate.firstName} ${r.affiliate.lastName}`,
        r.affiliate.email,
        r.affiliate.code,
        PAYOUT_METHOD_LABEL[r.affiliate.payoutMethod],
        r.affiliate.payoutHandle,
        r.stats.attributed.length,
        r.stats.earned.toFixed(2),
        r.stats.paid.toFixed(2),
        r.stats.due.toFixed(2),
      ]
        .map(csvCell)
        .join(","),
    );
    const csv = [header.join(","), ...lines].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const d = new Date();
    a.href = url;
    a.download = `borepix-affiliate-payouts-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-fg/85">
        <Badge tone="warning">Preview</Badge>
        Figures come from orders, pledges and partners recorded on this device. Connect the payments backend and put
        this page behind founder sign-in before launch.
      </p>

      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="panel rounded-2xl p-5">
            <dt className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">
              <k.icon className="size-4 text-silver" strokeWidth={1.75} aria-hidden />
              {k.label}
            </dt>
            <dd className="num mt-3 text-3xl font-semibold text-fg">{k.value}</dd>
            <dd className="mt-1 text-xs text-muted">{k.note}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="partners-heading" className="panel rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="partners-heading" className="flex items-center gap-2 text-lg font-semibold text-fg">
              <Users className="size-5 text-silver" strokeWidth={1.75} aria-hidden />
              Affiliate partners and payouts
            </h2>
            <p className="mt-1 text-sm text-muted">
              {affiliateProgram.commissionPercent}% commission · {affiliateProgram.payoutCadence.toLowerCase()} · minimum{" "}
              {formatPrice(affiliateProgram.minimumPayout)}
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="size-4" strokeWidth={1.75} aria-hidden />
            Export payout CSV
          </Button>
        </div>
        <p className="sr-only" aria-live="polite">
          {lastPayout ?? ""}
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
            No partners have joined on this device. The program sign-up is at {site.url.replace(/^https?:\/\//, "")}/affiliates.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[48rem] text-left text-sm">
              <thead className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">
                <tr className="border-b border-white/8">
                  <th scope="col" className="py-3 pr-4 font-medium">Partner</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Code</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Orders</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Earned</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Due</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Status</th>
                  <th scope="col" className="py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {rows.map(({ affiliate, stats }) => {
                  const payable = stats.due >= affiliateProgram.minimumPayout;
                  return (
                    <tr key={affiliate.id}>
                      <td className="py-3 pr-4">
                        <span className="block font-medium text-fg">
                          {affiliate.firstName} {affiliate.lastName}
                        </span>
                        <span className="block text-xs text-muted">{affiliate.email}</span>
                      </td>
                      <td className="num py-3 pr-4 text-blush">{affiliate.code}</td>
                      <td className="num py-3 pr-4 text-fg">{stats.attributed.length}</td>
                      <td className="num py-3 pr-4 text-fg">{formatPrice(stats.earned)}</td>
                      <td className="num py-3 pr-4 text-fg">{formatPrice(stats.due)}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={payable ? "success" : "neutral"}>{payable ? "Payable" : stats.due > 0 ? "Below minimum" : "Settled"}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={!payable}
                          onClick={() => {
                            const p = recordPayout(affiliate.id, stats.due);
                            if (p) setLastPayout(`Paid ${formatPrice(p.amount)} to ${affiliate.firstName} ${affiliate.lastName} by ${PAYOUT_METHOD_LABEL[p.method]}.`);
                          }}
                        >
                          Pay via {PAYOUT_METHOD_LABEL[affiliate.payoutMethod]}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {payouts.length > 0 ? (
          <div className="mt-6 border-t border-white/8 pt-5">
            <h3 className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted uppercase">Payout history</h3>
            <ul className="mt-3 divide-y divide-white/8 text-sm">
              {payouts.map((p) => {
                const a = affiliates.find((x) => x.id === p.affiliateId);
                return (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span className="text-fg">
                      {a ? `${a.firstName} ${a.lastName}` : "Former partner"} · {PAYOUT_METHOD_LABEL[p.method]}
                    </span>
                    <span className="num text-muted">
                      {formatPrice(p.amount)} · {dateFmt.format(p.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="orders-heading" className="panel rounded-2xl p-6 sm:p-8">
        <h2 id="orders-heading" className="flex items-center gap-2 text-lg font-semibold text-fg">
          <Receipt className="size-5 text-silver" strokeWidth={1.75} aria-hidden />
          Recent orders
        </h2>
        {orders.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">
            No orders on this device yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="font-mono text-[0.6875rem] tracking-[0.14em] text-muted uppercase">
                <tr className="border-b border-white/8">
                  <th scope="col" className="py-3 pr-4 font-medium">Order</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Date</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Customer</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Items</th>
                  <th scope="col" className="py-3 pr-4 font-medium">Referral</th>
                  <th scope="col" className="py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/8">
                {orders.slice(0, 12).map((o) => (
                  <tr key={o.id}>
                    <td className="num py-3 pr-4 text-fg">{o.number}</td>
                    <td className="py-3 pr-4 text-muted">{dateFmt.format(o.createdAt)}</td>
                    <td className="py-3 pr-4 text-muted">{o.email}</td>
                    <td className="num py-3 pr-4 text-fg">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                    <td className="num py-3 pr-4 text-blush">{o.referralCode ?? "—"}</td>
                    <td className="num py-3 text-right text-fg">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
