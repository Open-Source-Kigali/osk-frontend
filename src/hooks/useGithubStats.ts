import { useState, useEffect } from "react";
import { HERO_STATS } from "../constants/homepage";

interface Stat {
  number: number;
  label: string;
}

export function useGithubStats() {
  const [stats, setStats] = useState<Stat[]>(HERO_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        // Fetch organization details (for public repos count)
        const orgRes = await fetch("https://api.github.com/orgs/Open-Source-Kigali");
        const orgData = await orgRes.json();
        const reposCount = orgData.public_repos || 3;

        // Fetch total PRs across the organization
        const prsRes = await fetch(
          "https://api.github.com/search/issues?q=org:Open-Source-Kigali+type:pr"
        );
        const prsData = await prsRes.json();
        const prsCount = prsData.total_count || 25;

        // Fetch contributors for the main frontend repo as a proxy for total contributors
        const contributorsRes = await fetch(
          "https://api.github.com/repos/Open-Source-Kigali/osk-frontend/contributors?per_page=100"
        );
        const contributorsData = await contributorsRes.json();
        const contributorsCount = Array.isArray(contributorsData) 
          ? contributorsData.length 
          : 12;

        if (isMounted) {
          // Keep the 'Active Members' static stat from HERO_STATS (index 3)
          setStats([
            { number: contributorsCount, label: "Contributors" },
            { number: prsCount, label: "Pull Requests" },
            { number: reposCount, label: "Projects" },
            HERO_STATS[3], // { number: 1500, label: "Active Memebers" }
          ]);
        }
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
        // On error, the initial hardcoded HERO_STATS will remain
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, isLoading };
}
