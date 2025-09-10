"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  ArrowRightLeft, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus,
  Eye,
  Send,
  Inbox,
  Award,
  Activity
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import type { Product, Swap, Shoutout } from "@/types/models";
import { toast } from "sonner";

interface DashboardStats {
  totalProducts: number;
  approvedProducts: number;
  pendingProducts: number;
  totalSwaps: number;
  incomingSwaps: number;
  outgoingSwaps: number;
  completedSwaps: number;
  totalShoutouts: number;
  availableSwaps: number;
}

export default function UserDashboardPage() {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    approvedProducts: 0,
    pendingProducts: 0,
    totalSwaps: 0,
    incomingSwaps: 0,
    outgoingSwaps: 0,
    completedSwaps: 0,
    totalShoutouts: 0,
    availableSwaps: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        // Fetch user products
        const { data: products } = await supabaseClient
          .from("products")
          .select("*")
          .eq("user_id", userId);

        // Fetch user swaps
        const { data: swaps } = await supabaseClient
          .from("swaps")
          .select("*")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

        // Fetch user shoutouts
        const { data: shoutouts } = await supabaseClient
          .from("shoutouts")
          .select("*")
          .eq("user_id", userId);

        // Fetch swap limits directly from user_profile
        const { data: profile } = await supabaseClient
          .from("user_profile")
          .select("swap_limits")
          .eq("id", userId)
          .single();

        const productList = (products as Product[]) || [];
        const swapList = (swaps as Swap[]) || [];
        const shoutoutList = (shoutouts as Shoutout[]) || [];

        setStats({
          totalProducts: productList.length,
          approvedProducts: productList.filter(p => p.status === "approved").length,
          pendingProducts: productList.filter(p => p.status === "pending").length,
          totalSwaps: swapList.length,
          incomingSwaps: swapList.filter(s => s.receiver_id === userId && s.status === "pending").length,
          outgoingSwaps: swapList.filter(s => s.sender_id === userId && s.status === "pending").length,
          completedSwaps: swapList.filter(s => s.status === "accepted").length,
          totalShoutouts: shoutoutList.length,
          availableSwaps: (profile as any)?.swap_limits ?? 0,
        });

        // Create recent activity
        const activities = [
          ...swapList.slice(0, 3).map(swap => ({
            type: swap.sender_id === userId ? 'swap_sent' : 'swap_received',
            date: swap.created_at,
            status: swap.status
          })),
          ...productList.slice(0, 2).map(product => ({
            type: 'product_submitted',
            date: product.created_at,
            status: product.status,
            name: product.name
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        setRecentActivity(activities);
      } catch (error) {
        toast.error("Failed to load dashboard data: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [userId]);

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({length: 4}).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 h-32"></div>
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
              Welcome back, {userProfile?.first_name || 'Founder'}! 👋
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Here's your Swapify overview. Manage your products, track swaps, and grow your founder network.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/user/submit">
              <Button className="px-6 py-3 rounded-xl font-medium shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Submit Product
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">My Products</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.totalProducts}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.approvedProducts} approved
                  </p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Available Swaps</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.availableSwaps}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <ArrowRightLeft className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Swaps</p>
                  <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">
                    {stats.incomingSwaps + stats.outgoingSwaps}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stats.incomingSwaps} incoming
                  </p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {stats.totalSwaps > 0 ? Math.round((stats.completedSwaps / stats.totalSwaps) * 100) : 0}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stats.completedSwaps} completed
                  </p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Quick Actions</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Jump to the most important tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Link href="/user/browse">
                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700">
                  <Eye className="w-4 h-4 mr-3" />
                  Browse Products
                </Button>
              </Link>
              <Link href="/user/swap">
                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700">
                  <Inbox className="w-4 h-4 mr-3" />
                  Manage Swaps
                  {stats.incomingSwaps > 0 && (
                    <Badge className="ml-auto bg-slate-100 text-slate-700 border-slate-200">
                      {stats.incomingSwaps}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/user/my-products">
                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700">
                  <Package className="w-4 h-4 mr-3" />
                  My Products
                  {stats.pendingProducts > 0 && (
                    <Badge className="ml-auto bg-amber-100 text-amber-700 border-amber-200">
                      {stats.pendingProducts} pending
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link href="/user/shoutouts">
                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700">
                  <Star className="w-4 h-4 mr-3" />
                  Shoutouts & Reviews
                </Button>
              </Link>
              <Link href="/user/history">
                <Button variant="outline" className="w-full justify-start h-12 border-slate-200 dark:border-slate-700">
                  <Activity className="w-4 h-4 mr-3" />
                  Exchange History
                </Button>
              </Link>
              <Link href="/user/submit">
                <Button className="w-full justify-start h-12">
                  <Plus className="w-4 h-4 mr-3" />
                  Submit New Product
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Your latest platform interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Start by submitting your first product!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                        {activity.type === 'swap_sent' && <Send className="w-4 h-4 text-slate-600" />}
                        {activity.type === 'swap_received' && <Inbox className="w-4 h-4 text-slate-600" />}
                        {activity.type === 'product_submitted' && <Package className="w-4 h-4 text-slate-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.type === 'swap_sent' && 'Swap request sent'}
                          {activity.type === 'swap_received' && 'Swap request received'}
                          {activity.type === 'product_submitted' && `Product "${activity.name}" submitted`}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      <Badge 
                        className={`text-xs ${
                          activity.status === 'approved' || activity.status === 'accepted' 
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                            : activity.status === 'pending' 
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Swap Limit Info */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Swap Credits</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You have {stats.availableSwaps} swaps remaining. Earn more by leaving shoutouts!
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
                  {stats.availableSwaps}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
