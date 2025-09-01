"use server";

import { supabaseClient } from "@/lib/supabase-auth-client";

export const getContactsRecords = async (
  search: string,
  limit: number,
  page: number,
  blockList?: string[],
  source?: string
) => {
  let query = supabaseClient
    .from("contacts")
    .select("*", { count: "exact" })
    .eq("source", source);

  // Only apply the not-in filter if contactIds has values
  if (blockList && blockList.length > 0) {
    query = query.not("id", "in", `(${blockList.join(",")})`);
  }
  const { data, error, count }: any = await query
    .or(`name.ilike.${search}, contact_number.ilike.${search}`)
    .range(page * limit + (page === 0 ? 0 : 1), (page + 1) * limit)
    .order("created_at", { ascending: false });

  return {
    contacts: data,
    totalCount: count || 0,
  };
};
