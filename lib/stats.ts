import { getSupabaseClient } from "@/lib/auth";

export interface PlatformStats {
  users: number;
  teams: number;
  completedEvents: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const supabase = getSupabaseClient();

    const [{ count: userCount }, { count: teamCount }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("teams").select("id", { count: "exact", head: true }),
    ]);

    const now = new Date().toISOString();
    const { count: completedEventsCount } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .lt("ends_at", now);

    return {
      users: userCount || 0,
      teams: teamCount || 0,
      completedEvents: completedEventsCount || 0,
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    return { users: 0, teams: 0, completedEvents: 0 };
  }
}

