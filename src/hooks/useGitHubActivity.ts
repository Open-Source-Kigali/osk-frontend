import { useState, useEffect } from "react";
import type { ActivityItem, ActivityIconKey } from "@/constants";

const ORG = "open-source-kigali";
const API = `https://api.github.com/orgs/${ORG}/events?per_page=10`;

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

const ICON_BG: Record<ActivityIconKey, string> = {
  merge: "bg-green-500",
  pr: "bg-purple-500",
  join: "bg-blue-500",
  event: "bg-yellow-500",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEvent(e: any, id: number): ActivityItem | null {
  const actor = e.actor?.login ?? "Someone";
  const repo = e.repo?.name?.split("/")[1] ?? e.repo?.name ?? "a repo";

  switch (e.type) {
    case "PullRequestEvent": {
      const action = e.payload?.action;
      const num = e.payload?.pull_request?.number;
      if (action === "closed" && e.payload?.pull_request?.merged) {
        return { id, iconKey: "merge", iconBg: ICON_BG.merge, text: `${actor} merged PR #${num} into ${repo}`, time: timeAgo(e.created_at) };
      }
      if (action === "opened") {
        return { id, iconKey: "pr", iconBg: ICON_BG.pr, text: `${actor} opened PR #${num} on ${repo}`, time: timeAgo(e.created_at) };
      }
      return null;
    }
    case "IssuesEvent": {
      const num = e.payload?.issue?.number;
      return { id, iconKey: "pr", iconBg: ICON_BG.pr, text: `${actor} ${e.payload?.action} issue #${num} on ${repo}`, time: timeAgo(e.created_at) };
    }
    case "MemberEvent":
      return { id, iconKey: "join", iconBg: ICON_BG.join, text: `${e.payload?.member?.login ?? actor} joined ${repo} as a contributor`, time: timeAgo(e.created_at) };
    case "PushEvent": {
      const count = e.payload?.commits?.length ?? 1;
      return { id, iconKey: "merge", iconBg: ICON_BG.merge, text: `${actor} pushed ${count} commit${count > 1 ? "s" : ""} to ${repo}`, time: timeAgo(e.created_at) };
    }
    case "CreateEvent":
      return { id, iconKey: "event", iconBg: ICON_BG.event, text: `${actor} created ${e.payload?.ref_type} on ${repo}`, time: timeAgo(e.created_at) };
    default:
      return null;
  }
}

export function useGitHubActivity(limit = 5) {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then((events) => {
        const items: ActivityItem[] = [];
        let id = 1;
        for (const e of events) {
          if (items.length >= limit) break;
          const item = mapEvent(e, id);
          if (item) { items.push(item); id++; }
        }
        if (items.length > 0) setActivity(items);
      })
      .catch(() => {/* silently fall back to hardcoded data */})
      .finally(() => setLoading(false));
  }, [limit]);

  return { activity, loading };
}
