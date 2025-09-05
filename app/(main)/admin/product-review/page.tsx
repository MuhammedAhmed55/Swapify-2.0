"use client";

import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import type { Product } from "@/types/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Package, Calendar, Tag, ExternalLink, AlertCircle, Clock, Shield, User, CreditCard, Code } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminProductReviewPage() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [actionId, setActionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Failed to fetch products: " + error.message)
      } else {
        setProducts(data as Product[])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const updateStatus = async (id: string, next: Product["status"]) => {
    setActionId(id)
    // optimistic
    const prev = products
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, status: next } : p)))

    const { error } = await supabaseClient
      .from("products")
      .update({ status: next })
      .eq("id", id)

    if (error) {
      toast.error(`Failed to ${next === "approved" ? "approve" : "reject"} product: ` + error.message)
      // revert
      setProducts(prev)
    } else {
      toast.success(`Product ${next === "approved" ? "approved" : "rejected"} successfully!`)
      // remove from list if no longer pending
      if (next !== "pending") {
        setProducts((list) => list.filter((p) => p.id !== id))
      }
    }
    setActionId(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="space-y-4">
              {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 h-48"></div>
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
              Product Review 🔍
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Review and moderate product submissions. Approve quality products to make them available for swapping.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {products.length} {products.length === 1 ? 'product' : 'products'} pending
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        {products.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">All caught up!</h3>
                <p className="text-slate-600 dark:text-slate-400">No products pending review at the moment.</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">New submissions will appear here for moderation.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {products.map((product) => (
              <Card key={product.id} className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Product Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                          <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{product.name}</h3>
                          {product.description && (
                            <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                              {product.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                              <User className="w-3 h-3 mr-1" />
                              {product.user_id.substring(0, 8)}...
                            </Badge>
                            <Badge className={`${
                              product.redemption_type === 'stripe' 
                                ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                                : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                            }`}>
                              {product.redemption_type === 'stripe' ? (
                                <CreditCard className="w-3 h-3 mr-1" />
                              ) : (
                                <Code className="w-3 h-3 mr-1" />
                              )}
                              {product.redemption_type}
                            </Badge>
                            {product.tags && (
                              <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                <Tag className="w-3 h-3 mr-1" />
                                {product.tags}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Link */}
                      {product.product_link && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                          <div className="flex items-center gap-3">
                            <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Link</p>
                              <a 
                                href={product.product_link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm break-all underline underline-offset-2"
                              >
                                {product.product_link}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Submission Date */}
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted {formatDate(product.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:w-48">
                      <Button
                        onClick={() => updateStatus(product.id, "approved")}
                        disabled={actionId === product.id}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium shadow-sm disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {actionId === product.id ? "Approving..." : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => updateStatus(product.id, "rejected")}
                        disabled={actionId === product.id}
                        className="w-full border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20 py-3 rounded-xl font-medium disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {actionId === product.id ? "Rejecting..." : "Reject"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

