"use client";

import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import type { Product } from "@/types/models";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, Tag, CheckCircle2, Clock, AlertCircle, Plus, Edit, Trash2, ExternalLink, BarChart3, TrendingUp, Eye, XCircle, Settings, CreditCard } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function UserMyProductsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      // Get current user
      const { data: userData } = await supabaseClient.auth.getUser()
      const userId = (user?.id as string | undefined) ?? userData?.user?.id

      if (!userId) {
        setRows([])
        setLoading(false)
        return
      }

      // Fetch products for this user
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        toast.error("Failed to load products: " + error.message)
        setError(error.message)
        setRows([])
      } else {
        setError(null)
        setRows((data as Product[]) ?? [])
      }

      setLoading(false)
    }

    fetchProducts()
  }, [])

  const getStatusConfig = (status: Product["status"]) => {
    switch (status) {
      case "approved":
        return {
          color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
          icon: CheckCircle2,
          label: "Approved"
        }
      case "pending":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
          icon: Clock,
          label: "Under Review"
        }
      case "rejected":
        return {
          color: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
          icon: XCircle,
          label: "Rejected"
        }
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
          icon: Package,
          label: status
        }
    }
  }

  const getRedemptionConfig = (type: Product["redemption_type"]) => {
    switch (type) {
      case "manual":
        return {
          color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          icon: Settings,
          label: "Manual Setup"
        }
      case "stripe":
        return {
          color: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
          icon: CreditCard,
          label: "Stripe Integration"
        }
      default:
        return {
          color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
          icon: Package,
          label: type
        }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = {
    total: rows.length,
    approved: rows.filter(p => p.status === 'approved').length,
    pending: rows.filter(p => p.status === 'pending').length,
    rejected: rows.filter(p => p.status === 'rejected').length
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({length: 6}).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded flex-1"></div>
                      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                    </div>
                  </div>
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
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white mb-3">
              My Products
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Manage, track, and monitor your submitted products. View approval status and performance metrics.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/user/submit">
              <Button className="px-6 py-3 rounded-xl font-medium shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Products</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <Package className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.approved}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Under Review</p>
                  <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                  <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Rejected</p>
                  <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{stats.rejected}</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
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
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100">Failed to load products</h3>
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Grid */}
        {!loading && !error && (
          <>
            {rows.length === 0 ? (
              <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Package className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                    No products yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                    Start building your product portfolio by submitting your first product for review.
                  </p>
                  <Link href="/user/submit">
                    <Button className="px-6 py-3 rounded-xl font-medium">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Your First Product
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {rows.map((product) => {
                  const statusConfig = getStatusConfig(product.status);
                  const redemptionConfig = getRedemptionConfig(product.redemption_type);
                  const StatusIcon = statusConfig.icon;
                  const RedemptionIcon = redemptionConfig.icon;
                  
                  return (
                    <Card key={product.id} className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group h-full flex flex-col">
                      <CardContent className="p-6 flex flex-col h-full">
                        {/* Product Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-3 line-clamp-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${statusConfig.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </Badge>
                              <Badge className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${redemptionConfig.color}`}>
                                <RedemptionIcon className="w-3 h-3" />
                                {redemptionConfig.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-3 flex-shrink-0">
                            <Calendar className="w-3 h-3" />
                            {formatDate(product.created_at)}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 line-clamp-3 leading-relaxed">
                          {product.description || "No description provided for this product."}
                        </p>

                        {/* Product Link */}
                        {product.product_link && (
                          <div className="mb-5">
                            <div className="flex items-center gap-1 mb-2">
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Product Link</span>
                            </div>
                            <a 
                              href={product.product_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors truncate block"
                            >
                              {product.product_link}
                            </a>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 mt-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                            asChild
                          >
                            <Link href={`/user/products/${product.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </Button>
                          {product.status === 'approved' && (
                            <Button 
                              size="sm"
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Analytics
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

