import { useState, useEffect } from "react";

const ORG = "open-source-kigali";

interface GitHubStats {
  contributors: number;
  pullRequests: number;
  projects: number;
}

export function useGitHubStats() {
  const [stats, setStats] = useState<GitHubStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all public repos
        const reposRes = await fetch(
          `https://api.github.com/orgs/${ORG}/repos?per_page=100&type=public`
        );
        const repos: { name: string; full_name: string }[] = await reposRes.json();
        if (!Array.isArray(repos)) return;

        const projects = repos.length;

        // Fetch PRs and contributors in parallel across all repos
        const results = await Promise.all(
          repos.map(async (repo) => {
            const [prsRes, contribRes] = await Promise.all([
              fetch(`https://api.github.com/search/issues?q=repo:${repo.full_name}+type:pr+state:closed&per_page=1`),
              fetch(`https://api.github.com/repos/${repo.full_name}/contributors?per_page=100&anon=false`),
            ]);
            const prsData = await prsRes.json();
            const contribData = await contribRes.json();
            return {
              prs: prsData.total_count ?? 0,
              contributors: Array.isArray(contribData) ? contribData.map((c: { login: string }) => c.login) : [],
            };
          })
        );

        const pullRequests = results.reduce((sum, r) => sum + r.prs, 0);
        const uniqueContributors = new Set(results.flatMap((r) => r.contributors)).size;

        setStats({ contributors: uniqueContributors, pullRequests, projects });
      } catch {
        // silently fall back to hardcoded HERO_STATS
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
