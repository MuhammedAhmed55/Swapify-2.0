"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import type { Product, RedemptionType } from "@/types/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Package, 
  Settings, 
  CreditCard, 
  Tag, 
  Zap, 
  User,
  Clock,
  Shield,
  Star,
  ImageIcon
} from "lucide-react";
import Link from "next/link";
import { SwapRequestDialog } from "@/components/swap-request-dialog";

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id as string | undefined;
  const { user } = useAuth();
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
          color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
          icon: Settings,
          label: "Manual Setup",
        };
      case "stripe":
        return {
          color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
          icon: CreditCard,
          label: "Stripe Integration",
        };
      default:
        return {
          color: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
          icon: Package,
          label: "Standard",
        };
    }
  }, [product?.redemption_type]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-lg w-48 animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
                <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="text-slate-500 dark:text-slate-400 text-lg">
                {error || "Product not found"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const RedemptionIcon = redemptionConfig.icon;
  const isOwnProduct = user?.id === product?.user_id;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" asChild className="hover:bg-slate-50 dark:hover:bg-slate-800">
            <Link href="/user/browse">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Browse
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className={`${redemptionConfig.color} font-medium`}>
              <RedemptionIcon className="w-3 h-3 mr-1.5" />
              {redemptionConfig.label}
            </Badge>
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(product.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <Card className="border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                      {product.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>Owner: {product.user_id}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Listed {new Date(product.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <Shield className="w-5 h-5" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Separator />
                
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                    Product Description
                  </h3>
                  <div className="prose prose-slate max-w-none dark:prose-invert">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {product.description || "No description provided for this product."}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {product.tags && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.split(",").map((tag, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium"
                        >
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Swap Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    Swap Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                          Verified Listing
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          This product has been verified by our team
                        </p>
                      </div>
                    </div>

                    {!isOwnProduct && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                          How it works:
                        </h4>
                        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">1</span>
                            </div>
                            <p>Send a swap request with your product</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">2</span>
                            </div>
                            <p>Owner reviews your request</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">3</span>
                            </div>
                            <p>Complete the swap if accepted</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {isOwnProduct && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                          Your Product
                        </h4>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            This is your product listing. You can manage it from your products page or wait for swap requests from other users.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {!isOwnProduct ? (
                    <>
                      <Button 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100" 
                        size="lg"
                        onClick={() => setDialogOpen(true)}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Request Swap
                      </Button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        By requesting a swap, you agree to our terms of service
                      </p>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline"
                        className="w-full" 
                        size="lg"
                        asChild
                      >
                        <Link href="/user/my-products">
                          <Package className="w-4 h-4 mr-2" />
                          Manage My Products
                        </Link>
                      </Button>
                      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                        Edit or remove this product from your products page
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <SwapRequestDialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          targetProduct={product}
        />
      </div>
    </div>
  );
}
