"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Eye, CheckCircle2, XCircle, Package, ArrowLeftRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/lib/supabase-auth-client";
import { formatHumanReadableDate } from "@/utils/date-time-human-readable";

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read_status: boolean;
  created_at: string;
  updated_at: string;
}

export default function NotificationDropdown() {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Derive unread count fast
  const unreadCount = useMemo(() => notifications.filter((n) => !n.read_status).length, [notifications]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      if (!userProfile?.id) {
        setNotifications([]);
        return;
      }

      // Always scope to the current profile id (for both users and admins)
      let query = supabaseClient
        .from("notifications")
        .select("*")
        .eq("user_id", userProfile?.id || "");

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;

      setNotifications(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark single notification as read
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabaseClient
        .from("notifications")
        .update({ read_status: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_status: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      let query = supabaseClient
        .from("notifications")
        .update({ read_status: true })
        .eq("user_id", userProfile?.id || "");

      const { error } = await query;

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_status: true }))
      );
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Fetch notifications on mount
  useEffect(() => {
    if (userProfile?.id) fetchNotifications();
  }, [userProfile?.id]);

  // Helper: pick an icon based on message keywords
  const renderIcon = (message: string) => {
    const base = "h-4 w-4";
    if (/submitted a new product/i.test(message)) return <Package className={base + " text-blue-600"} />;
    if (/requested a swap/i.test(message)) return <ArrowLeftRight className={base + " text-amber-600"} />;
    if (/was approved/i.test(message)) return <CheckCircle2 className={base + " text-emerald-600"} />;
    if (/was rejected/i.test(message)) return <XCircle className={base + " text-red-600"} />;
    if (/swap request.*accepted/i.test(message)) return <CheckCircle2 className={base + " text-emerald-600"} />;
    if (/swap request.*rejected/i.test(message)) return <XCircle className={base + " text-red-600"} />;
    return <Info className={base + " text-slate-500"} />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative rounded-full"
          disabled={loading}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 text-[10px] px-1.5 py-0 rounded-full shadow-sm"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[24rem] p-0 overflow-hidden">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-500" />
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            {notifications.length > 0 && (
              <span className="text-xs text-slate-500">{notifications.length}</span>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-7 px-2 text-xs">
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Bell className="h-5 w-5 text-slate-400" />
              </div>
              <p className="text-sm">You're all caught up</p>
              <p className="text-xs text-slate-400">No notifications right now</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 flex items-start gap-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors ${
                  !n.read_status ? "bg-white dark:bg-slate-900/30" : ""
                }`}
                onClick={() => !n.read_status && markAsRead(n.id)}
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
                    {formatHumanReadableDate(n.created_at)}
                  </div>
                </div>
                {!n.read_status && <span className="mt-1.5 inline-block w-2 h-2 rounded-full bg-emerald-500" />}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
