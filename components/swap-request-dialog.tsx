"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { CheckCircle, CreditCard, Code, Star, Info, Send } from "lucide-react";

import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/types/models";

interface SwapRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: Product | null;
}

export function SwapRequestDialog({ isOpen, onClose, targetProduct }: SwapRequestDialogProps) {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const { userProfile } = useAuth();

  // Load approved products of the logged-in user
  useEffect(() => {
    const loadUserProducts = async () => {
      setProductsError(null);
      setLoadingProducts(true);
      try {
        const { data: auth } = await supabaseClient.auth.getUser();
        // Prefer profile id (matches products.user_id FK) but fall back to auth uid
        const uid = userProfile?.id || auth.user?.id;
        if (!uid) {
          setUserProducts([]);
          return;
        }
        const { data, error } = await supabaseClient
          .from("products")
          .select("*")
          .eq("user_id", uid)
          .in("status", ["approved", "Approved"]) // be tolerant to case variations
          .order("created_at", { ascending: false });
        if (error) throw error;
        const rows = (data as Product[]) || [];
        // Debug: see what we loaded
        console.log("swap-dialog: uid=", uid, " approved products loaded=", rows.length);
        setUserProducts(rows);
      } catch (e: any) {
        setProductsError(e.message || "Failed to load your products.");
      } finally {
        setLoadingProducts(false);
      }
    };
    if (isOpen) {
      loadUserProducts();
    }
  }, [isOpen, userProfile?.id]);

  // Submit swap request
  const handleSubmit = async () => {
    if (!targetProduct || !selectedProduct) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      // Get current user as sender (prefer profile id)
      const { data: userRes } = await supabaseClient.auth.getUser();
      const senderId = userProfile?.id || userRes.user?.id;
      if (!senderId) {
        throw new Error("You must be signed in to send a swap request.");
      }

      // Insert into swaps table with pending status
      const { error } = await supabaseClient.from("swaps").insert({
        sender_id: senderId,
        receiver_id: (targetProduct as any).user_id,
        product_id: targetProduct.id,
        status: "pending",
      });
      if (error) throw error;

      // Notify receiver (owner of target product) with actor name
      try {
        const now = new Date().toISOString();
        const actorName = userProfile?.first_name || userProfile?.last_name
          ? `${userProfile?.first_name || ""}${userProfile?.last_name ? " " + userProfile?.last_name : ""}`.trim()
          : (userRes.user?.email || "A user");
        const message = `${actorName} requested a swap for your product "${targetProduct.name}"`;
        await supabaseClient.from("notifications").insert({
          user_id: (targetProduct as any).user_id,
          message,
          read_status: false,
          created_at: now,
          updated_at: now,
        });
      } catch (nerr) {
        console.warn("Swap request notification insert failed", nerr);
      }

      setIsSubmitted(true);
    } catch (e: any) {
      console.error("swap insert failed", e);
      setSubmitError(e.message || "Failed to send swap request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedProduct("");
    setMessage("");
    setIsSubmitted(false);
    setSubmitError(null);
    onClose();
  };

  if (!targetProduct) return null;

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl">Swap Request Sent!</DialogTitle>
            <DialogDescription>
              Your swap request has been sent. You'll be notified when the owner responds.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>What happens next?</strong>
                <br />
                The product owner will review your request and either accept or decline it. You can track the status
                in your dashboard.
              </AlertDescription>
            </Alert>
            <Button onClick={handleClose} className="w-full rounded-2xl">
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Request a Swap</DialogTitle>
          <DialogDescription>Choose one of your approved products to exchange with {targetProduct.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {submitError && (
            <Alert>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Target Product Info */}
          <Card className="bg-muted/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">You want: {targetProduct.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{targetProduct.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {targetProduct.redemption_type === "stripe" ? (
                    <>
                      <CreditCard className="h-4 w-4 text-primary" />
                      <span>Stripe Integration</span>
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4" />
                      <span>Manual Code</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Selection */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="product-select">Select your approved product *</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={
                      loadingProducts
                        ? "Loading your products..."
                        : userProducts.length
                        ? "Choose an approved product"
                        : productsError
                        ? "Failed to load products"
                        : "No approved products found"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="z-50">
                  {userProducts.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Debug helper text */}
            {!loadingProducts && !productsError && (
              <p className="text-xs text-muted-foreground">Approved products found: {userProducts.length}</p>
            )}

            {/* Selected Product Details */}
            {selectedProduct && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">
                      You offer: {userProducts.find((p) => p.id === selectedProduct)?.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    {userProducts.find((p) => p.id === selectedProduct)?.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      {userProducts.find((p) => p.id === selectedProduct)?.redemption_type === "stripe" ? (
                        <>
                          <CreditCard className="h-4 w-4 text-primary" />
                          <span>Stripe Integration</span>
                        </>
                      ) : (
                        <>
                          <Code className="h-4 w-4" />
                          <span>Manual Code</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to introduce yourself and explain why you'd like to swap..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          {/* Swap Info */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Swap Process:</strong>
              <br />
              The product owner will review your request before accepting. You have limited free swaps remaining.
            </AlertDescription>
          </Alert>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={handleClose} className="flex-1 rounded-2xl">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedProduct || isSubmitting || loadingProducts || !!productsError}
              className="flex-1 rounded-2xl"
            >
              {isSubmitting ? "Sending Request..." : "Send Swap Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
