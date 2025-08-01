"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "../supabase";

export const createCompanion = async (formData: CreateCompanion) => {
  const { userId: author } = await auth();

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .insert({
      ...formData,
      author,
    })
    .select();

  if (error || !data)
    throw new Error(error?.message || "Failed to create companion!");

  return data[0];
};

export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: GetAllCompanions) => {
  // const { userId } = await auth();
  const supabase = await createSupabaseClient();

  let query = supabase.from("companions").select();
  // .eq("author", userId);

  if (subject && topic)
    query = query
      .ilike(`subject`, `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  else if (subject) query = query.ilike(`subject`, `%${subject}%`);
  else if (topic)
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);

  query = query.range((page - 1) * limit, page * limit - 1);

  const { data: companions, error } = await query;

  if (error) throw new Error(error?.message || "Failed to fetch companions!");

  return companions;
};

export const getCompanion = async (id: string) => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);

  if (error) throw new Error(error?.message || "Failed to fetch companion!");

  return data?.[0];
};

export const addToSessionHistory = async (companionId: string) => {
  const { userId } = await auth();

  const supabase = await createSupabaseClient();

  const { data, error } = await supabase.from("session_history").insert({
    user_id: userId,
    companion_id: companionId,
  });

  if (error)
    throw new Error(error?.message || "Failed to add to session history!");

  return data;
};

export const getRecentSessions = async (limit = 10) => {
  const { userId } = await auth();
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("session_history")
    .select("companions: companion_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error)
    throw new Error(error?.message || "Failed to fetch recent sessions!");

  return data.map(({ companions }) => companions);
};

export const getUserSessions = async (userId: string, limit = 10) => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("session_history")
    .select("companions: companion_id(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error)
    throw new Error(error?.message || "Failed to fetch recent sessions!");

  return data.map(({ companions }) => companions);
};

export const getUserCompanions = async (userId: string) => {
  const supabase = await createSupabaseClient();

  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", userId);

  if (error)
    throw new Error(error?.message || "Failed to fetch recent sessions!");

  return data;
};

export const newCompanionPermissions = async () => {
  const { userId, has } = await auth();
  const supabase = await createSupabaseClient();

  let limit = 0;

  if (has({ plan: "pro" })) {
    return true;
  } else if (has({ feature: "3_active_companions" })) {
    limit = 3;
  } else if (has({ feature: "10_active_companions" })) {
    limit = 10;
  }

  const { data, error } = await supabase
    .from("companions")
    .select(`id`, { count: "exact" })
    .eq("author", userId);

  if (error) throw new Error(error?.message);

  const companionCount = data.length;

  if (companionCount >= limit) return false;

  return true;
};
