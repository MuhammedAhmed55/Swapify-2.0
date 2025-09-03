"use client";

import React, { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { Product } from "@/types/models";
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
        console.error("Error fetching products:", error)
        toast.error("Failed to fetch products")
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
      console.error("Failed to update status", error)
      toast.error(`Failed to ${next === "approved" ? "approve" : "reject"} product`)
      // revert
      setProducts(prev)
    } else {
      toast.success(`Product ${next}`)
      // remove from list if no longer pending
      if (next !== "pending") {
        setProducts((list) => list.filter((p) => p.id !== id))
      }
    }
    setActionId(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product Review</h1>
          <p className="text-muted-foreground mt-1">Only products with status pending are shown here.</p>
        </div>
        <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
          {products.length} pending
        </span>
      </div>

      {loading && <p className="mt-6">Loading…</p>}

      {!loading && (
        <div className="mt-6 overflow-x-auto rounded-lg border bg-card shadow-sm">
          {products.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              <div className="mb-2 text-base font-medium text-foreground">No pending products</div>
              <p>New submissions will appear here for moderation.</p>
            </div>
          ) : (
            <table className="w-full text-xs sm:text-sm">
              <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
                <tr className="text-left">
                  <th className="p-3 font-medium text-foreground/80">Name</th>
                  <th className="p-3 font-medium text-foreground/80">User</th>
                  <th className="p-3 font-medium text-foreground/80">Link</th>
                  <th className="p-3 font-medium text-foreground/80">Submitted</th>
                  <th className="p-3 font-medium text-foreground/80">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t border-border/60 odd:bg-muted/30">
                    <td className="p-3 align-top">
                      <div className="max-w-[26rem] truncate font-medium text-foreground" title={p.name}>{p.name}</div>
                    </td>
                    <td className="p-3 align-top">
                      <span className="text-muted-foreground text-xs">{p.user_id}</span>
                    </td>
                    <td className="p-3 align-top">
                      {p.product_link ? (
                        <a href={p.product_link} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 truncate inline-block max-w-[20rem]" title={p.product_link}>
                          {p.product_link}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-3 align-top">
                      <span className="text-muted-foreground">{new Date(p.created_at).toLocaleString()}</span>
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(p.id, "approved")}
                          disabled={actionId === p.id}
                          className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(p.id, "rejected")}
                          disabled={actionId === p.id}
                          className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white shadow hover:bg-rose-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
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

