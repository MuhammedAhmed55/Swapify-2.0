"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ArrowRightLeft, Calendar, User, Send, Inbox, TrendingUp, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import type { Swap, Product } from "@/types/models";
import { toast } from "sonner";

type SwapRow = Swap & { product_name?: string };

export default function SwapsPage() {
  const { userProfile } = useAuth();
  const myId = userProfile?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swaps, setSwaps] = useState<SwapRow[]>([]);

  const incoming = useMemo(() => swaps.filter(s => s.receiver_id === myId && s.status === "pending"), [swaps, myId]);
  const outgoing = useMemo(() => swaps.filter(s => s.sender_id === myId && s.status === "pending"), [swaps, myId]);
  const completed = useMemo(() => swaps.filter(s => s.status === "accepted"), [swaps]);
  const rejected = useMemo(() => swaps.filter(s => s.status === "rejected"), [swaps]);

  useEffect(() => {
    const load = async () => {
      if (!myId) return;
      setLoading(true);
      setError(null);
      try {
        // fetch both incoming and outgoing for current user
        const { data, error } = await supabaseClient
          .from("swaps")
          .select("*")
          .or(`receiver_id.eq.${myId},sender_id.eq.${myId}`)
          .order("created_at", { ascending: false });
        if (error) throw error;

        const rows = (data as Swap[]) || [];
        // fetch product names for involved product ids
        const productIds = Array.from(new Set(rows.map(r => r.product_id)));
        let productsMap = new Map<string, string>();
        if (productIds.length) {
          const { data: prod, error: perr } = await supabaseClient
            .from("products")
            .select("id,name")
            .in("id", productIds);
          if (perr) throw perr;
          (prod as Pick<Product, "id" | "name">[]).forEach(p => productsMap.set(p.id, p.name));
        }

        const withNames: SwapRow[] = rows.map(r => ({ ...r, product_name: productsMap.get(r.product_id) }));
        setSwaps(withNames);
      } catch (e: any) {
        toast.error("Failed to load swaps: " + (e.message || "Unknown error"));
        setError(e.message || "Failed to load swaps");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [myId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const updateStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      const { error } = await supabaseClient.from("swaps").update({ status }).eq("id", id);
      if (error) throw error;
      // optimistic update
      setSwaps(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));
      toast.success(`Swap ${status === "accepted" ? "accepted" : "declined"} successfully!`);
    } catch (e: any) {
      toast.error("Failed to update swap: " + (e.message || "Unknown error"));
      setError(e.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
              Product Swaps
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Manage incoming and outgoing swap requests. Build connections through product exchanges.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {swaps.length} {swaps.length === 1 ? 'swap' : 'swaps'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Incoming</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{incoming.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Inbox className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Outgoing</p>
                  <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{outgoing.length}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                  <Send className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{completed.length}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {swaps.length > 0 ? Math.round((completed.length / swaps.length) * 100) : 0}%
                  </p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">Failed to load swaps</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Incoming Requests Section */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Inbox className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Incoming Requests</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Review and respond to swap requests from other users</CardDescription>
                </div>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 px-3 py-1">
                {incoming.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {incoming.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No incoming requests</h3>
                <p className="text-slate-600 dark:text-slate-400">When others request to swap with your products, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {incoming.map(request => (
                  <div key={request.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                          <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-lg">New Swap Request</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 px-3 py-2">
                        <Clock className="h-4 w-4 mr-2" />Awaiting Response
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">They want your product</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-lg">{request.product_name || request.product_id}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                        <ArrowRightLeft className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">In exchange for</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-lg">Their Product</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button 
                        onClick={() => updateStatus(request.id, "accepted")} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 py-3 rounded-xl font-medium shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Accept Swap
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => updateStatus(request.id, "rejected")} 
                        className="border-slate-300 dark:border-slate-600 flex-1 py-3 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Outgoing Requests Section */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                  <Send className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Your Requests</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Track the status of your outgoing swap requests</CardDescription>
                </div>
              </div>
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 px-3 py-1">
                {outgoing.length} pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {outgoing.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No outgoing requests</h3>
                <p className="text-slate-600 dark:text-slate-400">Start exploring products and send your first swap request!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {outgoing.map(request => (
                  <div key={request.id} className="p-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl">
                          <User className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-lg">Sent to Product Owner</h4>
                          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 px-3 py-2">
                        <Clock className="h-4 w-4 mr-2" />Awaiting Response
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 rounded-xl">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">You want</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-lg">{request.product_name || request.product_id}</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                        <ArrowRightLeft className="h-6 w-6 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">You offered</p>
                        <p className="font-semibold text-slate-900 dark:text-white text-lg">Your Product</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exchange History placeholder (optional) */}
        {/* You can later query accepted/completed swaps here */}
      </div>
    </div>
  );
}