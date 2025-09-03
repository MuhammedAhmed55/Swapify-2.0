"use client";

import React, { useEffect, useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import type { Product, RedemptionType } from "@/types/models";
import { toast } from "sonner";
import Link from "next/link";
import { Search, Calendar, Tag, CheckCircle2, Package } from "lucide-react";

export default function UserBrowseProductPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest")
  const [filterType, setFilterType] = useState<"all" | RedemptionType>("all")

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

  const getRedemptionTypeColor = (type: RedemptionType) => {
    switch (type) {
      case "manual":
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
      case "stripe":
        return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
    }
  }
  const getRedemptionTypeIcon = (type: RedemptionType) => {
    switch (type) {
      case "manual":
        return "🛠️"
      case "stripe":
        return "💳"
      default:
        return "📦"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Browse Products
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover amazing products and request swaps with other users
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                {filtered.length} products found
              </span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, description, or tags..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Filter by Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Redemption Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="all">All Types</option>
                  <option value="manual">Manual</option>
                  <option value="stripe">Stripe</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No products found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => { setQuery(""); setFilterType("all"); setSortBy("newest") }}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:-translate-y-1 group"
              >
                <div className="p-7">
                  {/* Product Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-xl truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getRedemptionTypeColor(product.redemption_type)}`}>
                          <span>{getRedemptionTypeIcon(product.redemption_type)}</span>
                          {product.redemption_type}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 ml-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {product.description || "No description provided."}
                  </p>

                  {/* Tags */}
                  {product.tags && (
                    <div className="flex items-center gap-1 mb-4">
                      <Tag className="w-3 h-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {product.tags.split(',').slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toast.info("Swap request submitted (demo)")}
                      className="flex-1 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
                    >
                      Request Swap
                    </button>
                    <button
                      onClick={() => toast.info("Detail view coming soon")}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
