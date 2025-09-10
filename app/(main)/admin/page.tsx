"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Package, 
  ArrowRightLeft, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Shield,
  Activity,
  Eye,
  FileText,
  BarChart3,
  UserCheck,
  PackageCheck,
  MessageSquare,
  DollarSign
} from "lucide-react";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import type { Product, Swap, Shoutout } from "@/types/models";
import { toast } from "sonner";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  rejectedProducts: number;
  totalSwaps: number;
  pendingSwaps: number;
  completedSwaps: number;
  totalShoutouts: number;
  platformSuccessRate: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  type: 'product_submission' | 'swap_request' | 'user_signup' | 'shoutout_posted';
  date: string;
  details: string;
  status?: string;
  user?: string;
}

export default function AdminDashboardPage() {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    rejectedProducts: 0,
    totalSwaps: 0,
    pendingSwaps: 0,
    completedSwaps: 0,
    totalShoutouts: 0,
    platformSuccessRate: 0,
    monthlyGrowth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Product[]>([]);

  useEffect(() => {
    const loadAdminData = async () => {
      setLoading(true);
      try {
        // Fetch all products
        const { data: products } = await supabaseClient
          .from("products")
          .select("*");

        // Fetch all swaps
        const { data: swaps } = await supabaseClient
          .from("swaps")
          .select("*");

        // Fetch all shoutouts
        const { data: shoutouts } = await supabaseClient
          .from("shoutouts")
          .select("*");

        // Fetch user count (assuming there's a users table or profiles table)
        const { count: userCount } = await supabaseClient
          .from("profiles")
          .select("*", { count: 'exact', head: true });

        const productList = (products as Product[]) || [];
        const swapList = (swaps as Swap[]) || [];
        const shoutoutList = (shoutouts as Shoutout[]) || [];

        // Calculate stats
        const pendingProducts = productList.filter(p => p.status === "pending");
        const approvedProducts = productList.filter(p => p.status === "approved");
        const completedSwaps = swapList.filter(s => s.status === "accepted");
        
        setStats({
          totalUsers: userCount || 0,
          activeUsers: Math.floor((userCount || 0) * 0.7), // Estimate 70% active
          totalProducts: productList.length,
          pendingProducts: pendingProducts.length,
          approvedProducts: approvedProducts.length,
          rejectedProducts: productList.filter(p => p.status === "rejected").length,
          totalSwaps: swapList.length,
          pendingSwaps: swapList.filter(s => s.status === "pending").length,
          completedSwaps: completedSwaps.length,
          totalShoutouts: shoutoutList.length,
          platformSuccessRate: swapList.length > 0 ? Math.round((completedSwaps.length / swapList.length) * 100) : 0,
          monthlyGrowth: 12, // Mock data - would calculate from actual dates
        });

        // Set pending reviews (first 5)
        setPendingReviews(pendingProducts.slice(0, 5));

        // Create recent activity
        const activities: RecentActivity[] = [
          ...productList.slice(0, 3).map(product => ({
            type: 'product_submission' as const,
            date: product.created_at,
            details: `New product "${product.name}" submitted`,
            status: product.status,
            user: 'User'
          })),
          ...swapList.slice(0, 2).map(swap => ({
            type: 'swap_request' as const,
            date: swap.created_at,
            details: 'New swap request initiated',
            status: swap.status
          })),
          ...shoutoutList.slice(0, 2).map(shoutout => ({
            type: 'shoutout_posted' as const,
            date: shoutout.created_at,
            details: `New ${shoutout.rating}-star review posted`,
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

        setRecentActivity(activities);
      } catch (error) {
        toast.error("Failed to load admin data: " + (error instanceof Error ? error.message : "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, []);

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
              {Array.from({length: 8}).map((_, i) => (
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
              Admin Dashboard 🛡️
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Monitor platform activity, manage product approvals, and oversee the Swapify community.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/product-review">
              <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-sm">
                <Shield className="w-4 h-4 mr-2" />
                Review Products
                {stats.pendingProducts > 0 && (
                  <Badge className="ml-2 bg-white text-red-600">
                    {stats.pendingProducts}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.totalUsers}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    {stats.activeUsers} active
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Products</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.totalProducts}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    {stats.pendingProducts} pending review
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                  <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Swaps</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.totalSwaps}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stats.completedSwaps} completed
                  </p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Success Rate</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stats.platformSuccessRate}%</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    +{stats.monthlyGrowth}% this month
                  </p>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved Products</p>
                  <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{stats.approvedProducts}</p>
                </div>
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                  <PackageCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Swaps</p>
                  <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400">{stats.pendingSwaps}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reviews</p>
                  <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.totalShoutouts}</p>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Revenue</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">$0</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Stripe fees</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pending Product Reviews */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Pending Reviews</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Products awaiting admin approval
                  </CardDescription>
                </div>
                <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">
                  {stats.pendingProducts} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {pendingReviews.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">All caught up!</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">No products pending review</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingReviews.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-white">{product.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {product.description?.substring(0, 60)}...
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                          Submitted {formatDate(product.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400">
                          {product.redemption_type}
                        </Badge>
                        <Link href={`/admin/product-review?id=${product.id}`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  {stats.pendingProducts > 5 && (
                    <Link href="/admin/product-review">
                      <Button variant="outline" className="w-full mt-4">
                        View All {stats.pendingProducts} Pending Products
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Platform Activity */}
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Latest platform events and user actions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800">
                        {activity.type === 'product_submission' && <Package className="w-4 h-4 text-purple-600" />}
                        {activity.type === 'swap_request' && <ArrowRightLeft className="w-4 h-4 text-emerald-600" />}
                        {activity.type === 'user_signup' && <UserCheck className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'shoutout_posted' && <Star className="w-4 h-4 text-amber-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {activity.details}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(activity.date)}
                        </p>
                      </div>
                      {activity.status && (
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Admin Actions */}
        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">Admin Actions</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Quick access to important admin functions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/product-review">
                <Button variant="outline" className="w-full h-16 flex-col gap-2 border-slate-200 dark:border-slate-700">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm">Review Products</span>
                  {stats.pendingProducts > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-100 text-red-700 border-red-200">
                      {stats.pendingProducts}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              <Link href="/admin/reports">
                <Button variant="outline" className="w-full h-16 flex-col gap-2 border-slate-200 dark:border-slate-700">
                  <BarChart3 className="w-5 h-5" />
                  <span className="text-sm">View Reports</span>
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full h-16 flex-col gap-2 border-slate-200 dark:border-slate-700">
                <Users className="w-5 h-5" />
                <span className="text-sm">Manage Users</span>
              </Button>
              
              <Button variant="outline" className="w-full h-16 flex-col gap-2 border-slate-200 dark:border-slate-700">
                <FileText className="w-5 h-5" />
                <span className="text-sm">Platform Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
