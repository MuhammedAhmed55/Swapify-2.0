"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  MessageSquare, 
  Plus, 
  Search, 
  Filter,
  Award,
  Calendar,
  User,
  ExternalLink,
  Heart,
  TrendingUp,
  Package
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import type { Shoutout, Product, Swap } from "@/types/models";
import { toast } from "sonner";

interface ShoutoutWithDetails extends Shoutout {
  product?: Product;
  user_profile?: {
    first_name: string;
    last_name: string;
  };
}

interface SwapWithProduct extends Swap {
  product?: Product;
}

export default function ShoutoutsPage() {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;
  
  const [loading, setLoading] = useState(true);
  const [shoutouts, setShoutouts] = useState<ShoutoutWithDetails[]>([]);
  const [myShoutouts, setMyShoutouts] = useState<ShoutoutWithDetails[]>([]);
  const [availableSwaps, setAvailableSwaps] = useState<SwapWithProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create shoutout form state
  const [selectedSwapId, setSelectedSwapId] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadShoutouts = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Fetch all shoutouts with product and user details
        const { data: allShoutouts } = await supabaseClient
          .from("shoutouts")
          .select(`
            *,
            product:products(*),
            user_profile:profiles(first_name, last_name)
          `)
          .order("created_at", { ascending: false });

        // Fetch user's own shoutouts
        const { data: userShoutouts } = await supabaseClient
          .from("shoutouts")
          .select(`
            *,
            product:products(*)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        // Fetch completed swaps that don't have shoutouts yet
        const { data: completedSwaps } = await supabaseClient
          .from("swaps")
          .select(`
            *,
            product:products(*)
          `)
          .eq("sender_id", userId)
          .eq("status", "accepted");

        if (completedSwaps && userShoutouts) {
          const swapsWithShoutouts = userShoutouts.map(s => s.product_id);
          const availableForShoutout = completedSwaps.filter(
            swap => !swapsWithShoutouts.includes(swap.product_id)
          );
          setAvailableSwaps(availableForShoutout as SwapWithProduct[]);
        }

        setShoutouts((allShoutouts as ShoutoutWithDetails[]) || []);
        setMyShoutouts((userShoutouts as ShoutoutWithDetails[]) || []);
      } catch (error) {
        toast.error("Failed to load shoutouts: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadShoutouts();
  }, [userId]);

  const handleCreateShoutout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSwapId || !content.trim()) {
      toast.error("Please select a swap and write a review");
      return;
    }

    setSubmitting(true);
    try {
      const selectedSwap = availableSwaps.find(s => s.id === selectedSwapId);
      if (!selectedSwap) {
        toast.error("Invalid swap selected");
        return;
      }

      const payload = {
        id: crypto.randomUUID?.() || undefined,
        user_id: userId,
        product_id: selectedSwap.product_id,
        content: content.trim(),
        rating,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabaseClient.from("shoutouts").insert(payload);

      if (error) {
        toast.error("Failed to create shoutout: " + error.message);
        return;
      }

      // Update swap limits to add earned swap
      const { error: limitError } = await supabaseClient
        .from("swap_limits")
        .upsert({
          user_id: userId,
          earned_swaps: 1,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (limitError) {
        console.warn("Failed to update swap limits:", limitError);
      }

      toast.success("Shoutout created successfully! You earned 1 additional swap credit.");
      setShowCreateDialog(false);
      setSelectedSwapId("");
      setContent("");
      setRating(5);
      
      // Reload data
      window.location.reload();
    } catch (error) {
      toast.error("Failed to create shoutout: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredShoutouts = shoutouts.filter(shoutout => {
    const matchesSearch = shoutout.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shoutout.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === "all" || shoutout.rating.toString() === filterRating;
    return matchesSearch && matchesRating;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {Array.from({length: 6}).map((_, i) => (
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
              Shoutouts & Reviews 🌟
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Discover what founders are saying about products and share your own experiences to earn swap credits.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {availableSwaps.length > 0 && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Write Shoutout
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Write a Shoutout</DialogTitle>
                    <DialogDescription>
                      Share your experience with a product you've swapped. Earn 1 additional swap credit!
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateShoutout} className="space-y-4">
                    <div>
                      <Label htmlFor="swap">Select Product</Label>
                      <Select value={selectedSwapId} onValueChange={setSelectedSwapId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a product to review" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSwaps.map((swap) => (
                            <SelectItem key={swap.id} value={swap.id}>
                              {swap.product?.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="rating">Rating</Label>
                      <Select value={rating.toString()} onValueChange={(value) => setRating(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              <div className="flex items-center gap-2">
                                {renderStars(num)}
                                <span>({num} star{num !== 1 ? 's' : ''})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="content">Your Review</Label>
                      <Textarea
                        id="content"
                        placeholder="Share your experience with this product..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? "Publishing..." : "Publish Shoutout"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Shoutouts</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{shoutouts.length}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">My Shoutouts</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{myShoutouts.length}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available to Review</p>
                  <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{availableSwaps.length}</p>
                </div>
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                  <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search shoutouts or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Shoutouts Grid */}
        {filteredShoutouts.length === 0 ? (
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No shoutouts found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm || filterRating !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Be the first to share your experience with a product!"
                }
              </p>
              {availableSwaps.length > 0 && (
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Write First Shoutout
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShoutouts.map((shoutout) => (
              <Card key={shoutout.id} className="border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                        {shoutout.product?.name || "Unknown Product"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(shoutout.rating)}
                        <span className="text-sm text-slate-500">({shoutout.rating}/5)</span>
                      </div>
                    </div>
                    {shoutout.user_id === userId && (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        My Review
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 dark:text-slate-300 mb-4 line-clamp-3">
                    {shoutout.content}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>
                        {shoutout.user_profile?.first_name} {shoutout.user_profile?.last_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(shoutout.created_at)}</span>
                    </div>
                  </div>

                  {shoutout.product?.product_link && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <Link 
                        href={shoutout.product.product_link} 
                        target="_blank"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Visit Product
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* My Shoutouts Section */}
        {myShoutouts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
              My Shoutouts ({myShoutouts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myShoutouts.map((shoutout) => (
                <Card key={shoutout.id} className="border-blue-200 dark:border-blue-700 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                      {shoutout.product?.name || "Unknown Product"}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {renderStars(shoutout.rating)}
                      <span className="text-sm text-slate-500">({shoutout.rating}/5)</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-slate-300 mb-4">
                      {shoutout.content}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(shoutout.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
