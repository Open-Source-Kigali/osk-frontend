import { AlertCircle, CheckCircle2, ExternalLink, Github } from "lucide-react";
import { Loader, SectionLabel } from "../UI";
import type { Issue } from "@/types";

const ISSUE_LABEL_STYLES: Record<Issue["label"], string> = {
	"good first issue": "bg-green-50 text-green-700 border-green-200",
	"help wanted": "bg-[#e8f1ff] text-[#2b7fff] border-[#c5d9ff]",
	bug: "bg-red-50 text-red-600 border-red-200",
	enhancement: "bg-violet-50 text-violet-700 border-violet-200",
};

const DIFFICULTY_STYLES: Record<Issue["difficulty"], string> = {
	beginner: "text-green-600",
	intermediate: "text-amber-600",
	advanced: "text-red-500",
};

// ─── Issue Row
const IssueRow = ({ issue }: { issue: Issue }) => (
	<a
		href={issue.link}
		target="_blank"
		rel="noopener noreferrer"
		className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0 group hover:bg-[#f0f6ff] -mx-5 px-5 rounded-lg transition-colors"
	>
		<AlertCircle
			size={16}
			className="mt-0.5 shrink-0 text-gray-300 group-hover:text-primary-colour transition-colors"
		/>
		<div className="flex-1 min-w-0">
			<p className="text-sm font-semibold text-gray-900 group-hover:text-primary-colour transition-colors mb-1.5 leading-snug">
				{issue.title}
			</p>
			<div className="flex flex-wrap items-center gap-2">
				<span
					className={`text-xs px-2 py-0.5 rounded-full font-bold border ${ISSUE_LABEL_STYLES[issue.label]}`}
				>
					{issue.label}
				</span>
				<span className="text-gray-300 text-xs">·</span>
				<span className="text-xs text-gray-400 font-mono">{issue.project}</span>
				<span className="text-gray-300 text-xs">·</span>
				<span
					className={`text-xs font-bold ${DIFFICULTY_STYLES[issue.difficulty]}`}
				>
					{issue.difficulty}
				</span>
			</div>
		</div>
		<ExternalLink
			size={13}
			className="text-gray-300 group-hover:text-primary-colour transition-colors shrink-0 mt-0.5"
		/>
	</a>
);

interface GoodFirstIssuesProps {
	issues: Issue[];
	loading: boolean;
	error: string | null;
}

const GoodFirstIssues = ({
	issues,
	loading,
	error,
}: GoodFirstIssuesProps) => {
	return (
		<section id="issues" className="py-20 px-6 md:px-20 bg-white">
			<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
				<div className="lg:col-span-2">
					<SectionLabel color="#f4511e">Good First Issues</SectionLabel>
					<h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 leading-snug">
						Start here
						<br />
						if you're new.
					</h2>
					<p className="text-gray-500 text-sm leading-relaxed mb-6">
						These issues are scoped, documented, and have a maintainer ready to
						review your PR within 48 hours. No experience needed.
					</p>
					<div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100 mb-6">
						<CheckCircle2
							size={16}
							className="text-green-600 shrink-0 mt-0.5"
						/>
						<p className="text-green-800 text-xs leading-relaxed">
							<strong>
								Every issue below has been written so a beginner can understand
								what needs to be done.
							</strong>{" "}
							Pick one, fork the repo, and open your first PR.
						</p>
					</div>
					<a
						href="https://github.com/Open-Source-Kigali/osk-frontend/issues"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-colors"
						style={{ background: "#2b7fff" }}
						onMouseEnter={(e) => (e.currentTarget.style.background = "#1a6fef")}
						onMouseLeave={(e) => (e.currentTarget.style.background = "#2b7fff")}
					>
						<Github size={14} /> View all issues on GitHub
					</a>
				</div>

				<div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
					<div className="flex items-center justify-between mb-2 pb-3 border-b border-gray-100">
						<p className="text-sm font-black text-gray-900">Open Issues</p>
						<span className="text-xs font-mono text-gray-400">
							{issues.length} issues
						</span>
					</div>
					{loading ? (
						<Loader text="Loading issues..." size={32} />
					) : error ? (
						<p className="py-10 text-center text-sm text-red-600">{error}</p>
					) : issues.length === 0 ? (
						<p className="py-10 text-center text-sm text-gray-500">
							No open good first issues right now.
						</p>
					) : (
						issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
					)}
				</div>
			</div>
		</section>
	);
};

export default GoodFirstIssues;
