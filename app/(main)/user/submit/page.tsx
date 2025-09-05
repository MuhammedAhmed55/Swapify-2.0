"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { Package, Send, CheckCircle, AlertCircle, CreditCard, Code, Link as LinkIcon } from "lucide-react";
import type { RedemptionType } from "@/types/models";
import { toast } from "sonner";

export default function UserSubmitProductPage() {
  const { user } = useAuth();

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
    const payload = {
      id: crypto.randomUUID?.() || undefined,
      user_id: user?.id,
      name,
      description,
      tags,
      redemption_type: redemptionType,
      product_link: productLink,
      status: "pending", // set implicitly
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseClient.from("products").insert(payload);

    if (error) {
      toast.error("Failed to submit product: " + error.message);
      setSubmitting(false);
      return;
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
