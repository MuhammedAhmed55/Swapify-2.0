"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { Bell, CheckCircle2, XCircle, ArrowLeftRight, Package, Info } from "lucide-react";
import Link from "next/link";

interface NotificationRow {
  id: string;
  user_id: string;
  message: string;
  read_status: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotificationsPage() {
  const { userProfile } = useAuth();
  const userId = userProfile?.id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_status).length, [notifications]);

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNotifications((data as NotificationRow[]) || []);
    } catch (e: any) {
      setError(e.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from("notifications")
        .update({ read_status: true })
        .eq("id", id);
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read_status: true } : n)));
    } catch (e) {
      console.error("Error marking read", e);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabaseClient
        .from("notifications")
        .update({ read_status: true })
        .eq("user_id", userId || "");
      if (error) throw error;
      setNotifications((prev) => prev.map((n) => ({ ...n, read_status: true })));
    } catch (e) {
      console.error("Error mark all read", e);
    }
  };

  const renderIcon = (message: string) => {
    const base = "h-4 w-4";
    if (/submitted a new product/i.test(message)) return <Package className={base + " text-blue-600"} />;
    if (/requested a swap/i.test(message)) return <ArrowLeftRight className={base + " text-amber-600"} />;
    if (/was approved|accepted/i.test(message)) return <CheckCircle2 className={base + " text-emerald-600"} />;
    if (/was rejected/i.test(message)) return <XCircle className={base + " text-red-600"} />;
    return <Info className={base + " text-slate-500"} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notifications</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">All your updates in one place</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
              {unreadCount} unread
            </Badge>
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchNotifications}>Refresh</Button>
            </div>
            <CardDescription>Latest platform and account activity</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-slate-500 dark:text-slate-400">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400">
                <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-slate-400" />
                </div>
                <p>No notifications yet</p>
                <p className="text-xs text-slate-400 mt-1">Activity will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 -m-6">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`px-6 py-4 flex items-start gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors ${
                      !n.read_status ? "bg-white dark:bg-slate-900/30" : ""
                    }`}
                  >
                    <div className="mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-sm">
                        {renderIcon(n.message)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read_status ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-white font-medium"}`}>
                        {n.message}
                      </p>
                      <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                      {!n.read_status && (
                        <div className="mt-2">
                          <Button size="sm" variant="outline" onClick={() => markAsRead(n.id)}>
                            Mark as read
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-sm text-slate-500 dark:text-slate-400">
          Looking for quick access?
          <span className="mx-1">•</span>
          Use the bell icon in the header or go back to the 
          <Link href="/user" className="ml-1 underline hover:no-underline text-slate-700 dark:text-slate-300">dashboard</Link>.
        </div>
      </div>
    </div>
  );
}
