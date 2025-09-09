"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import type { Product, RedemptionType } from "@/types/models";
import { toast } from "sonner";
import Link from "next/link";
import { Search, Calendar, Tag, CheckCircle2, Package, Filter, ArrowUpDown, Zap, CreditCard, Settings, Sparkles, TrendingUp, Users, Eye } from "lucide-react";
import { SwapRequestDialog } from "@/components/swap-request-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function UserBrowseProductPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest")
  const [filterType, setFilterType] = useState<"all" | RedemptionType>("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [targetProduct, setTargetProduct] = useState<Product | null>(null)

  useEffect(() => {
    const fetchApproved = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching approved products:", error)
        setError(error.message)
        toast.error("Failed to load products")
      } else {
        setProducts((data as Product[]) ?? [])
      }
      setLoading(false)
    }

    fetchApproved()
  }, [])

  const filtered = useMemo(() => {
    let result = products

    // search
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter((p) => {
        const hay = `${p.name} ${p.description ?? ""} ${p.tags ?? ""}`.toLowerCase()
        return hay.includes(q)
      })
    }

    // filter by redemption type
    if (filterType !== "all") {
      result = result.filter((p) => p.redemption_type === filterType)
    }

    // sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return result
  }, [products, query, filterType, sortBy])

  const getRedemptionTypeConfig = (type: RedemptionType) => {
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
          label: "Standard"
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({length: 4}).map((_, i) => (
                  <div key={i} className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                ))}
              </div>
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
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                <Sparkles className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Product Marketplace
              </h1>
            </div>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Discover and swap innovative products with fellow entrepreneurs. Find the perfect tools to grow your business.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl shadow-sm">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Products</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Verified</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Users</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{new Set(products.map(p => p.user_id)).size}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Search & Filter</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Search */}
              <div className="lg:col-span-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, description, or tags..."
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Filter by Type */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  <Filter className="inline w-4 h-4 mr-1" />
                  Redemption Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                >
                  <option value="all">All Types</option>
                  <option value="manual">Manual Setup</option>
                  <option value="stripe">Stripe Integration</option>
                </select>
              </div>

              {/* Sort */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  <ArrowUpDown className="inline w-4 h-4 mr-1" />
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-3 px-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {(!loading && filtered.length === 0) ? (
          <Card className="rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                No products found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                We couldn't find any products matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <Button
                onClick={() => { setQuery(""); setFilterType("all"); setSortBy("newest") }}
                className="px-6 py-3 rounded-xl font-medium"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((product) => {
                const redemptionConfig = getRedemptionTypeConfig(product.redemption_type);
                const RedemptionIcon = redemptionConfig.icon;
                
                return (
                  <Card
                    key={product.id}
                    className="rounded-2xl shadow-sm hover:shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1 group overflow-hidden h-full flex flex-col"
                  >
                    <CardContent className="p-6 flex flex-col h-full">
                      {/* Product Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white text-lg mb-3 line-clamp-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${redemptionConfig.color}`}>
                              <RedemptionIcon className="w-3 h-3" />
                              {redemptionConfig.label}
                            </span>
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

                      {/* Tags */}
                      {product.tags && (
                        <div className="mb-5">
                          <div className="flex items-center gap-1 mb-2">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Tags</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {product.tags.split(',').slice(0, 4).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-xs font-medium"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                            {product.tags.split(',').length > 4 && (
                              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-500 rounded-md text-xs">
                                +{product.tags.split(',').length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3 mt-auto">
                        <Button
                          onClick={() => { setTargetProduct(product); setDialogOpen(true) }}
                          className="flex-1 text-sm rounded-xl"
                        >
                          <Zap className="w-4 h-4" />
                          Request Swap
                        </Button>
                        <Button variant="outline" className="text-sm rounded-xl" asChild>
                          <Link href={`/user/products/${product.id}`}>
                            <Eye className="w-4 h-4" />
                            Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <SwapRequestDialog
              isOpen={dialogOpen}
              onClose={() => { setDialogOpen(false); setTargetProduct(null) }}
              targetProduct={targetProduct}
            />
          </>
        )}
      </div>
  );
}