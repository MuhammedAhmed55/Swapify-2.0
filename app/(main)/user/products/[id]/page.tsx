"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-auth-client";
import type { Product, RedemptionType } from "@/types/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, CheckCircle2, Package, Settings, CreditCard, Tag, Zap } from "lucide-react";
import Link from "next/link";
import { SwapRequestDialog } from "@/components/swap-request-dialog";

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabaseClient
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        setProduct((data as Product) ?? null);
      } catch (e: any) {
        setError(e.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const redemptionConfig = useMemo(() => {
    const type = (product?.redemption_type || "manual") as RedemptionType;
    switch (type) {
      case "manual":
        return {
          color:
            "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          icon: Settings,
          label: "Manual Setup",
        };
      case "stripe":
        return {
          color:
            "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
          icon: CreditCard,
          label: "Stripe Integration",
        };
      default:
        return {
          color:
            "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
          icon: Package,
          label: "Standard",
        };
    }
  }, [product?.redemption_type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse mb-4"></div>
          <div className="h-52 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
            <CardContent className="p-6 text-red-700 dark:text-red-300">
              {error || "Product not found"}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const RedemptionIcon = redemptionConfig.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" asChild>
            <Link href="/user/browse">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Badge className={`border ${redemptionConfig.color}`}>
              <RedemptionIcon className="w-3 h-3 mr-1" />
              {redemptionConfig.label}
            </Badge>
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(product.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-slate-900 dark:text-white">{product.name}</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Detailed information about this product and how to swap for it.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <h3>Description</h3>
                <p>{product.description || "No description provided."}</p>
              </div>
              {product.tags && (
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.split(",").map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-5 bg-white dark:bg-slate-800 h-full flex flex-col">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
                  <CheckCircle2 className="w-4 h-4" /> Verified Listing
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Swap your product for this one. The owner will receive your request and can accept or decline.
                </p>
                <Button className="mt-auto" onClick={() => setDialogOpen(true)}>
                  <Zap className="w-4 h-4 mr-2" /> Request Swap
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <SwapRequestDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          targetProduct={product}
        />
      </div>
    </div>
  );
}
