import { useMemo } from "react";
import { Link, useParams } from "react-router";
import {
	AlertCircle,
	ArrowLeft,
	ArrowUpRight,
	Clock,
	Code2,
	GitFork,
	GitPullRequest,
	Github,
	Star,
	Users,
} from "lucide-react";

import { useGoodFirstIssues, useProjects } from "@/hooks";
import type { ProjectStatus, Projects } from "@/types";

import { Card, Loader } from "@/components/UI";
import GoodFirstIssues from "@/components/projects/GoodFirstIssues";
import ProposeAProject from "@/components/projects/ProposeAProject";

const STATUS_META: Record<
	ProjectStatus,
	{
		label: string;
		dot: string;
		badge: string;
		text: string;
	}
> = {
	active: {
		label: "Active",
		dot: "bg-green-500",
		badge: "bg-green-50 border-green-200",
		text: "text-green-700",
	},
	seeking: {
		label: "Seeking Contributors",
		dot: "bg-[#2b7fff]",
		badge: "bg-[#e8f1ff] border-[#c5d9ff]",
		text: "text-[#2b7fff]",
	},
	maintenance: {
		label: "Maintenance",
		dot: "bg-amber-400",
		badge: "bg-amber-50 border-amber-200",
		text: "text-amber-700",
	},
	new: {
		label: "New",
		dot: "bg-violet-500",
		badge: "bg-violet-50 border-violet-200",
		text: "text-violet-700",
	},
};

const LangDot = ({ color, name }: { color: string; name: string }) => (
	<span className="flex items-center gap-1.5 text-xs text-gray-500">
		<span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
		{name}
	</span>
);

const StatusBadge = ({ status }: { status: ProjectStatus }) => {
	const m = STATUS_META[status];
	return (
		<span
			className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${m.badge} ${m.text}`}
		>
			<span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
			{m.label}
		</span>
	);
};

const TechPill = ({ tech }: { tech: string }) => (
	<span className="px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-xs font-mono">
		{tech}
	</span>
);

const ProjectDetails = () => {
	const { slug } = useParams(); // route param is the project slug
	const { projects, loading, error } = useProjects();
	const goodFirstIssues = useGoodFirstIssues();
	console.log(slug);

	const project: Projects | undefined = useMemo(() => {
		if (!slug) return undefined;
		return projects.find((p) => p.slug === slug);
	}, [slug, projects]);

	const hasTech = (p: Projects) => (p.techStack?.length ?? 0) > 0;

	return (
		<>
			<section className="pt-32 pb-10 px-6 md:px-20 bg-gray-50">
				<div className="max-w-7xl mx-auto">
					<Link
						to="/projects"
						className="inline-flex items-center gap-2 text-sm font-semibold text-[#2b7fff] hover:text-[#1a6fef] mb-6"
					>
						<ArrowLeft size={16} /> Back to Projects
					</Link>

					{loading ? (
						<div className="min-h-[40vh] flex items-center justify-center">
							<Loader />
						</div>
					) : error ? (
						<div className="text-center py-24 text-gray-400">
							<Code2 size={36} className="mx-auto mb-4 opacity-30" />
							<p className="font-semibold text-red-500">
								Couldn't load project.
							</p>
							<p className="text-sm mt-1 text-gray-500">{error}</p>
						</div>
					) : !project ? (
						<div className="text-center py-24 text-gray-400">
							<AlertCircle size={36} className="mx-auto mb-4 opacity-30" />
							<p className="font-semibold text-gray-600">Project not found.</p>
							<p className="text-sm mt-1 text-gray-500">
								Try selecting a project from the list.
							</p>
						</div>
					) : (
						<Card className="overflow-hidden" padding="none">
							<div className="md:flex md:items-stretch">
								<div className="md:w-2/5 h-56 sm:h-72 md:h-auto relative overflow-hidden">
									<img
										src={project.image}
										alt={project.title}
										className="w-full h-full object-cover"
									/>
									<div className="absolute top-4 left-4">
										<StatusBadge status={project.status} />
									</div>
								</div>

								<div className="md:w-3/5 p-6 sm:p-8 md:p-10">
									<div className="flex flex-wrap items-center gap-2 mb-4">
										<LangDot
											color={project.langColor}
											name={project.language}
										/>
										<span className="text-gray-200">·</span>
										<span className="flex items-center gap-1 text-xs text-gray-400">
											<Clock size={11} /> {project.lastActivity}
										</span>
									</div>

									<h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
										{project.title}
									</h1>
									{project.tagline ? (
										<p className="text-[#f4511e] font-semibold text-sm mb-4">
											{project.tagline}
										</p>
									) : null}

									<p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6">
										{project.description}
									</p>

									{hasTech(project) ? (
										<div className="flex flex-wrap gap-2 mb-6">
											{project.techStack.map((t) => (
												<TechPill key={t} tech={t} />
											))}
										</div>
									) : null}

									<div className="flex flex-wrap gap-5 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
										<span className="flex items-center gap-1.5">
											<Users size={14} className="text-[#5b9fff]" />
											<strong className="text-gray-900">
												{project.stats.contributors}
											</strong>{" "}
											contributors
										</span>
										<span className="flex items-center gap-1.5">
											<GitPullRequest size={14} className="text-[#5b9fff]" />
											<strong className="text-gray-900">
												{project.stats.prs}
											</strong>{" "}
											PRs merged
										</span>
										<span className="flex items-center gap-1.5">
											<AlertCircle size={14} className="text-[#f4511e]" />
											<strong className="text-gray-900">
												{project.stats.openIssues}
											</strong>{" "}
											open issues
										</span>
										<span className="flex items-center gap-1.5">
											<Star size={14} className="text-amber-400" />
											<strong className="text-gray-900">
												{project.stats.stars}
											</strong>
										</span>
										<span className="flex items-center gap-1.5">
											<GitFork size={14} className="text-gray-300" />
											<strong className="text-gray-900">
												{project.stats.forks}
											</strong>
										</span>
									</div>

									<div className="flex flex-wrap gap-3">
										<a
											href={project.repoUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-colors"
											style={{ background: "#2b7fff" }}
											onMouseEnter={(e) =>
												(e.currentTarget.style.background = "#1a6fef")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.background = "#2b7fff")
											}
										>
											<Github size={16} /> View Repository
										</a>

										{project.liveUrl ? (
											<a
												href={project.liveUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-colors"
												style={{ borderColor: "#c5d9ff", color: "#2b7fff" }}
												onMouseEnter={(e) => {
													e.currentTarget.style.background = "#2b7fff";
													e.currentTarget.style.color = "#fff";
													e.currentTarget.style.borderColor = "#2b7fff";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.background = "transparent";
													e.currentTarget.style.color = "#2b7fff";
													e.currentTarget.style.borderColor = "#c5d9ff";
												}}
											>
												<ArrowUpRight size={14} /> Live Site
											</a>
										) : null}
									</div>
								</div>
							</div>
						</Card>
					)}
				</div>
			</section>

			{/* Keep the app flow consistent with /projects */}
			<GoodFirstIssues {...goodFirstIssues} />
			<ProposeAProject />
		</>
	);
};

export default ProjectDetails;
