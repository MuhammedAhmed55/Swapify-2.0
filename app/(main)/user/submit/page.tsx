"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { toast } from "sonner";

export default function UserSubmitProductPage() {
  const { user, userProfile } = useAuth();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [redemptionType, setRedemptionType] = useState<string>("");
  const [productLink, setProductLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!redemptionType) {
      alert("Please select a redemption type.");
      setSubmitting(false);
      return;
    }

    // 1. Insert product
    const payload = {
      id: crypto.randomUUID?.() || undefined,
      user_id: user?.id,
      name,
      description,
      tags,
      redemption_type: redemptionType,
      product_link: productLink,
      status: "pending", // default status
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabaseClient.from("products").insert(payload);

    if (error) {
      toast.error("Failed to submit product: " + error.message);
      setSubmitting(false);
      return;
    }

    // 2. Notify all admins dynamically (client-side only)
    try {
      // a) Get admin role id
      const { data: roleRow, error: roleErr } = await supabaseClient
        .from("roles")
        .select("id")
        .eq("name", "admin")
        .single();
      if (roleErr) throw roleErr;

      // b) Get all users with admin role
      const { data: adminUsers, error: adminsErr } = await supabaseClient
        .from("user_profile")
        .select("id")
        .eq("role_id", roleRow.id);
      if (adminsErr) throw adminsErr;

      // c) Insert notifications for those admin users only
      if (adminUsers && adminUsers.length > 0) {
        const now = new Date().toISOString();
        const actorName = userProfile?.first_name || userProfile?.last_name
          ? `${userProfile?.first_name || ""}${userProfile?.last_name ? " " + userProfile?.last_name : ""}`.trim()
          : (user?.email || "A user");
        const notifications = adminUsers.map((u: any) => ({
          user_id: u.id,
          message: `${actorName} submitted a new product: ${name}`,
          read_status: false,
          created_at: now,
          updated_at: now,
        }));
        await supabaseClient.from("notifications").insert(notifications);
      }
    } catch (e) {
      console.warn("Failed to create admin notifications", e);
    }

    toast.success("Product submitted successfully! It will be reviewed by an admin.");

    // Reset form
    setName("");
    setDescription("");
    setTags("");
    setRedemptionType("");
    setProductLink("");
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Submit Product</h1>
      <p className="text-muted-foreground mt-2">
        Fill the details below to submit your product for review.
      </p>

      <div className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <Input
              placeholder="e.g. My Awesome SaaS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              rows={5}
              placeholder="Describe your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <Input
              placeholder="e.g. SaaS, AI, Marketing"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Comma-separated values</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Redemption Type</label>
              <Select value={redemptionType} onValueChange={setRedemptionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">manual</SelectItem>
                  <SelectItem value="stripe">stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Product Link</label>
            <Input
              placeholder="https://yourproduct.com"
              type="url"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
