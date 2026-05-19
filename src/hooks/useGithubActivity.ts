import { useState, useEffect } from "react";

interface GithubActivityItem {
  id: string;
  iconKey: "push" | "pr" | "issue" | "default";
  text: string;
  time: string;
}

export const useGithubActivity = () => {
  const [activities, setActivities] = useState<GithubActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "https://api.github.com/repos/Open-Source-Kigali/osk-frontend/events?per_page=7"
        );
        
        if (!response.ok) throw new Error("Failed to fetch GitHub events");
        
        const data = await response.json();

        const formattedActivities = data.map((event: any) => {
          let iconKey: "push" | "pr" | "issue" | "default" = "default";
          let text = `${event.actor.login} performed an action`;

          if (event.type === "PushEvent") {
            iconKey = "push";
            const commitMessage = event.payload.commits?.[0]?.message || "";
            text = `${event.actor.login} pushed: "${commitMessage}"`;
          } else if (event.type === "PullRequestEvent") {
            iconKey = "pr";
            text = `${event.actor.login} ${event.payload.action} a pull request`;
          } else if (event.type === "IssuesEvent") {
            iconKey = "issue";
            text = `${event.actor.login} ${event.payload.action} an issue`;
          }

          const eventDate = new Date(event.created_at);
          const timeString = eventDate.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return {
            id: event.id,
            iconKey,
            text,
            time: timeString,
          };
        });

        setActivities(formattedActivities);
      } catch (error) {
        console.error(error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return { activities, isLoading, isError };
};