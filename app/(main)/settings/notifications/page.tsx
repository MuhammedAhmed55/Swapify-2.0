"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Prefs {
  email: boolean;
  push: boolean;
  productUpdates: boolean;
  swapEvents: boolean;
  shoutouts: boolean;
  digest: "off" | "daily" | "weekly";
}

const STORAGE_KEY = "notifications_prefs";

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<Prefs>({
    email: true,
    push: false,
    productUpdates: true,
    swapEvents: true,
    shoutouts: true,
    digest: "daily",
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setPrefs((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      setSavedAt(new Date().toLocaleTimeString());
    } finally {
      setSaving(false);
    }
  };

  const onToggle = (key: keyof Prefs, value: boolean) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Notification Preferences</h1>
          <p className="text-slate-600 dark:text-slate-400">Control how and when you receive updates.</p>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle>Channels</CardTitle>
            <CardDescription>Choose your preferred delivery channels.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <Checkbox checked={prefs.email} onCheckedChange={(v) => onToggle("email", Boolean(v))} />
              <span className="text-slate-700 dark:text-slate-300">Email notifications</span>
            </label>
            <label className="flex items-center gap-3">
              <Checkbox checked={prefs.push} onCheckedChange={(v) => onToggle("push", Boolean(v))} />
              <span className="text-slate-700 dark:text-slate-300">Push notifications</span>
            </label>
          </CardContent>
        </Card>

        <div className="h-4" />

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle>Types</CardTitle>
            <CardDescription>Pick the kinds of updates you want.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3">
              <Checkbox checked={prefs.productUpdates} onCheckedChange={(v) => onToggle("productUpdates", Boolean(v))} />
              <span className="text-slate-700 dark:text-slate-300">Product updates (approvals, changes)</span>
            </label>
            <label className="flex items-center gap-3">
              <Checkbox checked={prefs.swapEvents} onCheckedChange={(v) => onToggle("swapEvents", Boolean(v))} />
              <span className="text-slate-700 dark:text-slate-300">Swap events (requests, accepts, declines)</span>
            </label>
            <label className="flex items-center gap-3">
              <Checkbox checked={prefs.shoutouts} onCheckedChange={(v) => onToggle("shoutouts", Boolean(v))} />
              <span className="text-slate-700 dark:text-slate-300">Shoutouts & reviews</span>
            </label>
          </CardContent>
        </Card>

        <div className="h-4" />

        <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader>
            <CardTitle>Digest</CardTitle>
            <CardDescription>Get a summary periodically.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <label className="text-slate-700 dark:text-slate-300">Frequency</label>
              <select
                value={prefs.digest}
                onChange={(e) => setPrefs((p) => ({ ...p, digest: e.target.value as Prefs["digest"] }))}
                className="w-full py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="off">Off</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Preferences"}</Button>
          {savedAt && (
            <span className="text-sm text-slate-500 dark:text-slate-400">Saved at {savedAt}</span>
          )}
        </div>
      </div>
    </div>
  );
}
