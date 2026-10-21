import type { Issue } from "@/types";

const GITHUB_ISSUES_URL =
	"https://api.github.com/repos/Open-Source-Kigali/osk-frontend/issues";

interface GitHubIssueLabel {
	name: string;
}

interface GitHubIssue {
	number: number;
	title: string;
	html_url: string;
	labels: GitHubIssueLabel[];
	user?: {
		login: string;
	};
	pull_request?: unknown;
}

export async function fetchGoodFirstIssues(): Promise<Issue[]> {
	const response = await fetch(
		`${GITHUB_ISSUES_URL}?state=open&labels=good%20first%20issue&per_page=10`,
		{
			headers: {
				Accept: "application/vnd.github+json",
			},
		},
	);

	if (!response.ok) {
		throw new Error(`GitHub request failed (${response.status})`);
	}

	const issues: GitHubIssue[] = await response.json();

	return issues
		.filter((issue) => !issue.pull_request)
		.map((issue) => ({
			id: issue.number,
			title: issue.title,
			label: "good first issue",
			project: issue.user?.login ?? "Open-Source-Kigali/osk-frontend",
			projectSlug: "osk-frontend",
			difficulty: "beginner",
			link: issue.html_url,
		}));
}