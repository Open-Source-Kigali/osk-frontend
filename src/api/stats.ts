import type { Stats } from "@/types";
import { apiGet } from "./client";

export async function fetchStats(): Promise<Stats> {
  return apiGet<Stats>("/stats");
}
