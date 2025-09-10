"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, MessageSquare } from "lucide-react";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-auth-client";
import type { Shoutout, Product } from "@/types/models";

interface ShoutoutWithProduct extends Shoutout {
  product?: Product;
}

export default function ShoutoutsRail() {
  const [items, setItems] = useState<ShoutoutWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseClient
          .from("shoutouts")
          .select("*, product:products(*)")
          .order("created_at", { ascending: false })
          .limit(8);
        if (error) throw error;
        setItems((data as any) || []);
      } catch (e) {
        console.warn("Failed to load shoutouts rail", e);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "text-amber-400 fill-amber-400" : "text-slate-300"}`} />
      ))}
    </div>
  );

  return (
    <aside className="lg:sticky lg:top-6 lg:max-h-[80vh] overflow-y-auto">
      <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-base">Recent Shoutouts</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-500">No shoutouts yet. Be the first to share!</p>
          ) : (
            <div className="space-y-4">
              {items.map((s) => (
                <div key={s.id} className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(s.rating)}
                        <Badge className="bg-slate-100 text-slate-700 border-slate-200">{s.rating}/5</Badge>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{s.content}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <div className="truncate">
                      {s.product?.name ? (
                        <>
                          <span className="text-slate-400">For</span> {s.product.name}
                        </>
                      ) : (
                        <span>Unknown product</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/user/shoutouts" className="block text-center text-sm font-medium text-slate-700 dark:text-slate-300 hover:underline underline-offset-4">
                View all shoutouts
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
