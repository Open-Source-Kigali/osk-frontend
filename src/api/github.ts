import type { Issue } from "@/types";


export async function fetchGoodFirstIssues(): Promise<Issue[]> {
  const response = await fetch(
    "https://api.github.com/repos/Open-Source-Kigali/osk-frontend/issues?state=open&labels=good+first+issue"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch issues");
  }

  const data = await response.json();

  return data
    .filter((item: any) => !item.pull_request)
    .map((item: any) => ({
      id: item.number,
      title: item.title,
      label: "good first issue",
      project: "Open Source Kigali",
      projectSlug: "osk-frontend",
      difficulty: "beginner",
      link: item.html_url,
    }));
}