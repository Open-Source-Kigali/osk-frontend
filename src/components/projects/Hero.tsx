import { Filter, Search } from "lucide-react";
import EyebrowLabel from "../UI/EyebrowLabel";
import { StatNumber } from "../UI";
import type { ProjectCategory, ProjectStatus } from "@/types";

interface HeroProps {
	totalProjects: number;
	totalOpenIssues: number;
	totalContributors: number;
	search: string;
	setSearch: (s: string) => void;
	setFilter: (key: "category" | "status", value: string) => void;
	filters: {
		category: string;
		status: "all" | ProjectStatus;
	};
}

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

const CATEGORY_FILTERS: { key: ProjectCategory; label: string }[] = [
	{ key: "all", label: "All Projects" },
	{ key: "platform", label: "Platform" },
	{ key: "health", label: "Health" },
	{ key: "education", label: "Education" },
	{ key: "maps", label: "Maps & Data" },
	{ key: "tools", label: "Dev Tools" },
];

const Hero = ({
	totalProjects,
	totalOpenIssues,
	totalContributors,
	search,
	setSearch,
	setFilter,
	filters,
}: HeroProps) => {
	return (
		<section
			className="pt-32 pb-0 px-6 md:px-20 relative overflow-hidden"
			style={{ background: "#0a0f1e" }}
		>
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage:
						"radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 0)",
					backgroundSize: "32px 32px",
				}}
			/>
			<div
				className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
				style={{
					background:
						"radial-gradient(circle, rgba(43,127,255,0.12) 0%, transparent 70%)",
				}}
			/>

			<div className="relative max-w-7xl mx-auto">
				<EyebrowLabel text=" Open Source Projects" align="left" />

				<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12">
					<div>
						<h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-none tracking-tight mb-5">
							Real projects.
							<br />
							<span style={{ color: "#5b9fff" }}>Real code.</span>
							<br />
							<span className="text-white/30">Ready for your PR.</span>
						</h1>
						<p className="text-white/50 text-base md:text-lg leading-relaxed max-w-xl">
							Every project here solves a real problem in Rwanda or beyond. Pick
							one, claim an issue, and ship something you can point to.
						</p>
					</div>

					{/* Stats — derived from PROJECTS constant, always accurate */}
					<div className="grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden shrink-0">
						{[
							{ n: totalProjects, label: "Projects" },
							{ n: totalOpenIssues, label: "Open Issues" },
							{ n: totalContributors, label: "Contributors" },
						].map((s, index) => (
							<div key={s.label} className="bg-white/5 px-6 py-5 text-center">
								<p className="text-2xl font-black text-white">
									<StatNumber value={s.n} delay={index * 120} />
								</p>
								<p className="text-xs text-white/40 mt-1">{s.label}</p>
							</div>
						))}
					</div>
				</div>

				{/* Search + status filters */}
				<div className="flex flex-col sm:flex-row gap-3 mb-0">
					<div className="relative flex-1 max-w-sm">
						<Search
							size={15}
							className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30"
						/>
						<input
							type="text"
							placeholder="Search projects or tech stack…"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="w-full pl-9 pr-4 py-2.5 bg-white/8 border border-white/15 rounded-full text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary-colour transition-colors"
						/>
					</div>

					<div className="flex items-center gap-1.5 flex-wrap">
						<Filter size={13} className="text-white/30 shrink-0" />
						{(["all", "active", "seeking", "new", "maintenance"] as const).map(
							(s) => (
								<button
									key={s}
									onClick={() => setFilter("status", s)}
									className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize hover:cursor-pointer"
									style={
										filters.status === s
											? { background: "#2b7fff", color: "#fff" }
											: {
													background: "rgba(255,255,255,0.08)",
													color: "rgba(255,255,255,0.5)",
													border: "1px solid rgba(255,255,255,0.1)",
												}
									}
								>
									{s === "all"
										? "All"
										: (STATUS_META[s as ProjectStatus]?.label ?? s)}
								</button>
							),
						)}
					</div>
				</div>

				{/* Category tabs */}
				<div className="flex gap-0 mt-8 overflow-x-auto">
					{CATEGORY_FILTERS.map((cat) => (
						<button
							key={cat.key}
							onClick={() => setFilter("category", cat.key)}
							className="px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors hover:cursor-pointer"
							style={
								filters.category === cat.key
									? { borderColor: "#2b7fff", color: "#5b9fff" }
									: {
											borderColor: "transparent",
											color: "rgba(255,255,255,0.35)",
										}
							}
						>
							{cat.label}
						</button>
					))}
				</div>
			</div>
		</section>
	);
};

export default Hero;
