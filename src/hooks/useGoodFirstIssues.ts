import { useEffect, useState } from "react";
import { fetchGoodFirstIssues } from "@/api";
import type { Issue } from "@/types";

interface UseGoodFirstIssuesReturn {
	issues: Issue[];
	loading: boolean;
	error: string | null;
}

export function useGoodFirstIssues(): UseGoodFirstIssuesReturn {
	const [issues, setIssues] = useState<Issue[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		fetchGoodFirstIssues()
			.then((data) => {
				if (!cancelled) {
					setIssues(data);
					setError(null);
				}
			})
			.catch((err: Error) => {
				if (!cancelled) setError(err.message);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, []);

	return { issues, loading, error };
}