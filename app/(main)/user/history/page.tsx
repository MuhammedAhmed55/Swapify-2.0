"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import type { Swap, Product } from "@/types/models";
import { ArrowRightLeft, Calendar, Package, Activity, Search } from "lucide-react";
import { toast } from "sonner";

interface SwapRow extends Swap {
  product_name?: string;
}

export default function ExchangeHistoryPage() {
  const { userProfile } = useAuth();
  const myId = userProfile?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swaps, setSwaps] = useState<SwapRow[]>([]);
  const [query, setQuery] = useState("");

  const completed = useMemo(() => swaps.filter((s) => s.status === "accepted"), [swaps]);

  useEffect(() => {
    const load = async () => {
      if (!myId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabaseClient
          .from("swaps")
          .select("*")
          .or(`receiver_id.eq.${myId},sender_id.eq.${myId}`)
          .eq("status", "accepted")
          .order("created_at", { ascending: false });
        if (error) throw error;
        const rows = (data as Swap[]) || [];
        const productIds = Array.from(new Set(rows.map((r) => r.product_id)));
        let productsMap = new Map<string, string>();
        if (productIds.length) {
          const { data: prod, error: perr } = await supabaseClient
            .from("products")
            .select("id,name")
            .in("id", productIds);
          if (perr) throw perr;
          (prod as Pick<Product, "id" | "name">[]).forEach((p) => productsMap.set(p.id, p.name));
        }
        setSwaps(rows.map((r) => ({ ...r, product_name: productsMap.get(r.product_id) })));
      } catch (e: any) {
        setError(e.message || "Failed to load exchange history");
        toast.error("Failed to load exchange history: " + (e.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [myId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return completed;
    return completed.filter((s) => `${s.product_name || ""} ${s.product_id}`.toLowerCase().includes(q));
  }, [completed, query]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
              Exchange History
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              A record of your completed swaps.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {completed.length} completed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Search</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name..."
              className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* History List */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <ArrowRightLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Exchange History</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Complete record of all your swap transactions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No completed swaps found</h3>
                <p className="text-slate-600 dark:text-slate-400">Completed swaps will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item) => (
                  <Card key={item.id} className="border-slate-200 dark:border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                            <ArrowRightLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 dark:text-white text-lg">Swap Completed</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(item.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 px-3 py-2">
                          Completed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Product</p>
                          <p className="font-semibold text-slate-900 dark:text-white text-lg">{item.product_name || item.product_id}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
