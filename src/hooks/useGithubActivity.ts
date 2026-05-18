import { useState, useEffect } from "react";
import { CTA_ACTIVITY } from "../constants/homepage";
import type { ActivityItem, ActivityIconKey } from "../constants/homepage";

export function useGithubActivity() {
  const [activity, setActivity] = useState<ActivityItem[]>(CTA_ACTIVITY);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchActivity() {
      try {
        const res = await fetch("https://api.github.com/orgs/Open-Source-Kigali/events?per_page=30");
        if (!res.ok) throw new Error("Failed to fetch events");
        
        const events = await res.json();
        
        const parsedActivities: ActivityItem[] = [];
        let idCounter = 1;

        for (const event of events) {
          if (parsedActivities.length >= 5) break;

          const actor = event.actor.display_login || event.actor.login;
          const repoName = event.repo.name.split("/").pop() || "repository";
          
          let iconKey: ActivityIconKey | null = null;
          let iconBg = "";
          let text = "";

          if (event.type === "PullRequestEvent") {
            const { action, pull_request } = event.payload;
            if (action === "opened") {
              iconKey = "pr";
              iconBg = "bg-purple-500";
              text = `${actor} opened PR #${event.payload.number} in ${repoName}`;
            } else if (action === "closed" && pull_request.merged) {
              iconKey = "merge";
              iconBg = "bg-green-500";
              text = `${actor} merged PR #${event.payload.number} into ${repoName}`;
            }
          } else if (event.type === "IssuesEvent" && event.payload.action === "opened") {
            iconKey = "event";
            iconBg = "bg-yellow-500";
            text = `${actor} opened issue #${event.payload.issue.number} on ${repoName}`;
          } else if (event.type === "MemberEvent" && event.payload.action === "added") {
            iconKey = "join";
            iconBg = "bg-blue-500";
            text = `${actor} joined as a new contributor`;
          }

          if (iconKey && text) {
            // Calculate relative time
            const eventDate = new Date(event.created_at);
            const now = new Date();
            const diffMs = now.getTime() - eventDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            let timeStr = "";
            if (diffMins < 60) timeStr = `${diffMins} min ago`;
            else if (diffHours < 24) timeStr = `${diffHours} hr ago`;
            else timeStr = `${diffDays} days ago`;

            parsedActivities.push({
              id: idCounter++,
              iconKey,
              iconBg,
              text,
              time: timeStr
            });
          }
        }

        // Fill with static data if we don't have enough events
        const finalActivities = [...parsedActivities];
        let staticIndex = 0;
        while (finalActivities.length < 5 && staticIndex < CTA_ACTIVITY.length) {
          finalActivities.push({
            ...CTA_ACTIVITY[staticIndex],
            id: idCounter++
          });
          staticIndex++;
        }

        if (isMounted) {
          setActivity(finalActivities);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub activity:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchActivity();

    return () => {
      isMounted = false;
    };
  }, []);

  return { activity, isLoading };
}
