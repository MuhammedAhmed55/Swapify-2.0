"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-auth-client";
import type { Product, Swap, Shoutout } from "@/types/models";
import { toast } from "sonner";

type DateRangePreset = "7d" | "30d" | "90d" | "ytd";
type Category = "all" | "users" | "products" | "swaps" | "revenue";

type KPI = { label: string; value: number; delta: number };
type Trend = { date: string; users: number; products: number; swaps: number; revenue: number };
type TopProduct = { name: string; swaps: number };
type TableRow = { id: string; date: string; user: string; product: string; type: string; amount: number };

function numberFormat(n: number) {
  return n.toLocaleString();
}

function exportCsv(rows: any[]) {
  const headers = Object.keys(rows[0] || {});
  const csv = [headers.join(",")]
    .concat(rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `swapify-report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function startDateForPreset(preset: DateRangePreset) {
  const now = new Date();
  const start = new Date(now);
  if (preset === "7d") start.setDate(now.getDate() - 6);
  else if (preset === "30d") start.setDate(now.getDate() - 29);
  else if (preset === "90d") start.setDate(now.getDate() - 89);
  else if (preset === "ytd") start.setMonth(0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function previousWindow(start: Date, end: Date) {
  const diffMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start);
  const prevStart = new Date(start.getTime() - diffMs);
  prevEnd.setMilliseconds(prevEnd.getMilliseconds() - 1);
  return { prevStart, prevEnd };
}

export default function AdminReportsPage() {
  const [preset, setPreset] = useState<DateRangePreset>("30d");
  const [category, setCategory] = useState<Category>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [kpis, setKpis] = useState<Record<string, KPI>>({});
  const [trends, setTrends] = useState<Trend[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [tableRows, setTableRows] = useState<TableRow[]>([]);

  // Fetch and compute data for the selected preset
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const start = startDateForPreset(preset);
        const now = new Date();
        const { prevStart, prevEnd } = previousWindow(start, now);

        // Fetch raw rows in a single pass each
        const [{ data: profiles, error: e1 }, { data: products, error: e2 }, { data: swaps, error: e3 }, { data: shoutouts, error: e4 }] = await Promise.all([
          supabaseClient.from("user_profile").select("id, created_at"),
          supabaseClient.from("products").select("id, name, created_at, status"),
          supabaseClient.from("swaps").select("id, created_at, status, product_id"),
          supabaseClient.from("shoutouts").select("id, created_at, rating, product_id, user_id"),
        ]);

        if (e1 || e2 || e3 || e4) throw new Error((e1 || e2 || e3 || e4)?.message || "Failed to load data");

        const inRange = (d?: string | null) => !!d && new Date(d) >= start && new Date(d) <= now;
        const inPrev = (d?: string | null) => !!d && new Date(d) >= prevStart && new Date(d) <= prevEnd;

        // KPIs current period
        const usersNow = (profiles || []).filter((p) => inRange(p.created_at as any)).length;
        const productsNow = (products || []).filter((p) => inRange((p as any).created_at)).length;
        const swapsNow = (swaps || []).filter((s) => inRange((s as any).created_at) && (s as any).status === "accepted").length;
        const revenueNow = 0; // Placeholder (integrate Stripe later)

        // KPIs previous period for delta
        const usersPrev = (profiles || []).filter((p) => inPrev(p.created_at as any)).length;
        const productsPrev = (products || []).filter((p) => inPrev((p as any).created_at)).length;
        const swapsPrev = (swaps || []).filter((s) => inPrev((s as any).created_at) && (s as any).status === "accepted").length;
        const revenuePrev = 0;

        const pctDelta = (nowV: number, prevV: number) => {
          if (prevV === 0) return nowV > 0 ? 100 : 0;
          return Math.round(((nowV - prevV) / prevV) * 1000) / 10;
        };

        setKpis({
          users: { label: "New Users", value: usersNow, delta: pctDelta(usersNow, usersPrev) },
          products: { label: "New Products", value: productsNow, delta: pctDelta(productsNow, productsPrev) },
          swaps: { label: "Completed Swaps", value: swapsNow, delta: pctDelta(swapsNow, swapsPrev) },
          revenue: { label: "Revenue ($)", value: revenueNow, delta: pctDelta(revenueNow, revenuePrev) },
        });

        // Build daily buckets between start..now
        const fmtDay = (d: Date) => d.toISOString().slice(0, 10);
        const days: string[] = [];
        const cur = new Date(start);
        while (cur <= now) {
          days.push(fmtDay(cur));
          cur.setDate(cur.getDate() + 1);
        }
        const dayIndex: Record<string, Trend> = Object.fromEntries(
          days.map((d) => [d, { date: d, users: 0, products: 0, swaps: 0, revenue: 0 }])
        );

        (profiles || []).forEach((p: any) => {
          const d = fmtDay(new Date(p.created_at));
          if (dayIndex[d]) dayIndex[d].users += 1;
        });
        (products || []).forEach((p: any) => {
          const d = fmtDay(new Date(p.created_at));
          if (dayIndex[d]) dayIndex[d].products += 1;
        });
        (swaps || []).forEach((s: any) => {
          if (s.status !== "accepted") return;
          const d = fmtDay(new Date(s.created_at));
          if (dayIndex[d]) dayIndex[d].swaps += 1;
        });
        // revenue can be added similarly when integrated

        setTrends(days.map((d) => dayIndex[d]));

        // Top products by completed swaps in range
        const swapCounts: Record<string, number> = {};
        (swaps || [])
          .filter((s: any) => s.status === "accepted" && inRange(s.created_at))
          .forEach((s: any) => {
            swapCounts[s.product_id] = (swapCounts[s.product_id] || 0) + 1;
          });
        const productNameById: Record<string, string> = Object.fromEntries(
          (products || []).map((p: any) => [p.id, p.name])
        );
        const top: TopProduct[] = Object.entries(swapCounts)
          .map(([pid, count]) => ({ name: productNameById[pid] || pid, swaps: count }))
          .sort((a, b) => b.swaps - a.swaps)
          .slice(0, 5);
        setTopProducts(top);

        // Recent activity table (mixed)
        const rows: TableRow[] = [];
        (profiles || [])
          .filter((p: any) => inRange(p.created_at))
          .slice(0, 20)
          .forEach((p: any, i: number) =>
            rows.push({ id: `U-${p.id.slice(0, 6)}`, date: fmtDay(new Date(p.created_at)), user: "New user", product: "—", type: "signup", amount: 0 })
          );
        (products || [])
          .filter((p: any) => inRange(p.created_at))
          .slice(0, 20)
          .forEach((p: any) =>
            rows.push({ id: `P-${p.id.slice(0, 6)}`, date: fmtDay(new Date(p.created_at)), user: "—", product: p.name, type: "product", amount: 0 })
          );
        (swaps || [])
          .filter((s: any) => inRange(s.created_at))
          .slice(0, 20)
          .forEach((s: any) =>
            rows.push({ id: `S-${s.id.slice(0, 6)}`, date: fmtDay(new Date(s.created_at)), user: "—", product: productNameById[s.product_id] || s.product_id, type: "swap", amount: 0 })
          );
        (shoutouts || [])
          .filter((sh: any) => inRange(sh.created_at))
          .slice(0, 10)
          .forEach((sh: any) =>
            rows.push({ id: `R-${sh.id.slice(0, 6)}`, date: fmtDay(new Date(sh.created_at)), user: "—", product: productNameById[sh.product_id] || sh.product_id, type: "review", amount: 0 })
          );

        rows.sort((a, b) => (a.date > b.date ? -1 : 1));
        setTableRows(rows.slice(0, 50));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [preset]);

  const filteredTrends = useMemo(() => trends, [trends]);
  const maxForScale = useMemo(() => {
    if (category === "revenue") return Math.max(1, ...filteredTrends.map((d) => d.revenue));
    if (category === "users") return Math.max(1, ...filteredTrends.map((d) => d.users));
    if (category === "products") return Math.max(1, ...filteredTrends.map((d) => d.products));
    if (category === "swaps") return Math.max(1, ...filteredTrends.map((d) => d.swaps));
    return Math.max(
      1,
      ...filteredTrends.map((d) => Math.max(d.users, d.products, d.swaps))
    );
  }, [filteredTrends, category]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Reports</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">View analytics and platform reports.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d", "ytd"] as DateRangePreset[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={
                "px-3 py-1.5 rounded-md border text-sm transition-colors " +
                (preset === p
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800")
              }
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-400">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="px-3 py-1.5 rounded-md border bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
          >
            <option value="all">All</option>
            <option value="users">Users</option>
            <option value="products">Products</option>
            <option value="swaps">Swaps</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-pulse h-28" />
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(kpis).map(([key, kpi]) => (
          <div
            key={key}
            className="rounded-lg border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div className="text-sm text-slate-600 dark:text-slate-400">{kpi.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-2xl font-semibold text-slate-900 dark:text-white">{numberFormat(kpi.value)}</div>
              <div
                className={
                  "text-xs px-1.5 py-0.5 rounded-md border " +
                  (kpi.delta >= 0
                    ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800")
                }
              >
                {kpi.delta >= 0 ? "+" : ""}
                {kpi.delta}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trends */}
      <div className="rounded-lg border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Trends</div>
            <div className="text-lg font-semibold text-slate-900 dark:text-white">{category === "all" ? "All Categories" : category[0].toUpperCase() + category.slice(1)}</div>
          </div>
          <button
            onClick={() => exportCsv(tableRows)}
            className="px-3 py-1.5 rounded-md border text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Export CSV
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-3 items-end h-40">
          {filteredTrends.map((d) => {
            const value =
              category === "users"
                ? d.users
                : category === "products"
                ? d.products
                : category === "swaps"
                ? d.swaps
                : category === "revenue"
                ? d.revenue
                : Math.max(d.users, d.products, d.swaps);
            const height = maxForScale ? Math.max(6, Math.round((value / maxForScale) * 100)) : 0;
            return (
              <div key={d.date} className="flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-md bg-slate-200 dark:bg-slate-700"
                  style={{ height: `${height}%` }}
                  title={`${d.date}: ${value}`}
                />
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{d.date.slice(5)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top lists + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-lg border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <div className="text-sm text-slate-600 dark:text-slate-400">Top Products by Swaps</div>
          <ul className="mt-3 space-y-2">
            {topProducts.map((p) => (
              <li key={p.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-800 dark:text-slate-200">{p.name}</span>
                <span className="text-slate-500 dark:text-slate-400">{p.swaps} swaps</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2 rounded-lg border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-600 dark:text-slate-400">Recent Activity</div>
            <Link href="/app/(main)/admin" className="text-sm text-slate-900 dark:text-white hover:underline">
              View dashboard
            </Link>
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Type</th>
                <th className="py-2 pr-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((r) => (
                <tr key={r.id} className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="py-2 pr-3 text-slate-800 dark:text-slate-200">{r.id}</td>
                  <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{r.date}</td>
                  <td className="py-2 pr-3 text-slate-800 dark:text-slate-200">{r.user}</td>
                  <td className="py-2 pr-3 text-slate-700 dark:text-slate-300">{r.product}</td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        "px-2 py-0.5 rounded-md border text-xs " +
                        (r.type === "signup"
                          ? "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                          : r.type === "product"
                          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400"
                          : r.type === "swap"
                          ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                          : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400")
                      }
                    >
                      {r.type}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right text-slate-800 dark:text-slate-200">{r.amount ? `$${r.amount}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
