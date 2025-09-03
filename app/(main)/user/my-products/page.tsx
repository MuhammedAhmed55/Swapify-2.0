"use client";

import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/models";
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
        console.error("Error fetching products:", error)
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
  // Columns to render with labels
  const columns: Array<{ key: keyof Product; header: string }> = [
    { key: "name", header: "Name" },
    { key: "status", header: "Status" },
    { key: "redemption_type", header: "Redemption" },
    { key: "product_link", header: "Link" },
    { key: "created_at", header: "Created" },
  ]

  const renderStatus = (status: Product["status"]) => {
    const map: Record<Product["status"], string> = {
      approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
      pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
      rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status]}`}>
        {status}
      </span>
    )
  }

  const renderRedemption = (type: Product["redemption_type"]) => {
    const map: Record<Product["redemption_type"], string> = {
      manual: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
      stripe: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[type]}`}>
        {type}
      </span>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Products</h1>
          <p className="text-muted-foreground mt-1">Manage and track your submitted products.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            {rows.length} total
          </span>
          <Link href="/user/submit" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90">
            + Add Product
          </Link>
        </div>
      </div>

      {loading && <p className="mt-6">Loading…</p>}
      {error && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          Failed to load products: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 overflow-x-auto rounded-lg border bg-card shadow-sm">
          {rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <div className="mb-2 text-base font-medium text-foreground">No products found</div>
              <p>Get started by adding your first product.</p>
              <div className="mt-4">
                <Link href="/user/submit" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90">
                  + Add Product
                </Link>
              </div>
            </div>
          ) : (
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                <tr className="text-left">
                  {columns.map(({ key, header }) => (
                    <th key={key as string} className="p-3 font-medium text-foreground/80">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id ?? idx} className="border-t border-border/60 odd:bg-muted/30">
                    {columns.map(({ key }) => (
                      <td key={key as string} className="p-3 align-top">
                        {key === "status" && renderStatus(r.status)}
                        {key === "redemption_type" && renderRedemption(r.redemption_type)}
                        {key === "name" && (
                          <div className="max-w-[26rem] truncate font-medium text-foreground" title={r.name}>{r.name}</div>
                        )}
                        {key === "product_link" && (
                          r.product_link ? (
                            <a href={r.product_link} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 truncate inline-block max-w-[20rem]" title={r.product_link}>
                              {r.product_link}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )
                        )}
                        {key === "created_at" && (
                          <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

