import { NavLink }          from "react-router";
import {Github, ArrowUpRight, GitPullRequest, Users, AlertCircle, Star, GitFork, Search, Filter, ExternalLink, Code2, Zap, CheckCircle2, Clock} from "lucide-react";
import { Badge } from '@/components/UI/';
import { Card, SectionLabel, Loader } from "@/components/UI";
import { useFilter, useProjects } from "@/hooks";
import { GOOD_FIRST_ISSUES } from "@/constants";
import type { Projects,Issue,ProjectStatus,ProjectCategory } from "@/types";
import EyebrowLabel from "@/components/UI/EyebrowLable";

// ─── Meta maps
const STATUS_META: Record<ProjectStatus, {
  label: string; dot: string; badge: string; text: string;
}> = {
  active:      { label: "Active",               dot: "bg-green-500",   badge: "bg-green-50 border-green-200",   text: "text-green-700"  },
  seeking:     { label: "Seeking Contributors", dot: "bg-[#2b7fff]",   badge: "bg-[#e8f1ff] border-[#c5d9ff]", text: "text-[#2b7fff]"  },
  maintenance: { label: "Maintenance",          dot: "bg-amber-400",   badge: "bg-amber-50 border-amber-200",   text: "text-amber-700"  },
  new:         { label: "New",                  dot: "bg-violet-500",  badge: "bg-violet-50 border-violet-200", text: "text-violet-700" },
};

const CATEGORY_FILTERS: { key: ProjectCategory; label: string }[] = [
  { key: "all",       label: "All Projects" },
  { key: "platform",  label: "Platform"     },
  { key: "health",    label: "Health"       },
  { key: "education", label: "Education"    },
  { key: "maps",      label: "Maps & Data"  },
  { key: "tools",     label: "Dev Tools"    },
];

const ISSUE_LABEL_STYLES: Record<Issue["label"], string> = {
  "good first issue": "bg-green-50 text-green-700 border-green-200",
  "help wanted":      "bg-[#e8f1ff] text-[#2b7fff] border-[#c5d9ff]",
  "bug":              "bg-red-50 text-red-600 border-red-200",
  "enhancement":      "bg-violet-50 text-violet-700 border-violet-200",
};

const DIFFICULTY_STYLES: Record<Issue["difficulty"], string> = {
  beginner:     "text-green-600",
  intermediate: "text-amber-600",
  advanced:     "text-red-500",
};

// ─── Sub-components 
const StatusBadge = ({ status }: { status: ProjectStatus }) => {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${m.badge} ${m.text}`}>
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

const LangDot = ({ color, name }: { color: string; name: string }) => (
  <span className="flex items-center gap-1.5 text-xs text-gray-500">
    <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
    {name}
  </span>
);

// ─── Featured Card 
const FeaturedCard = ({ project }: { project: Projects }) => (
  <div className="bg-white rounded-2xl border border-[#c5d9ff] overflow-hidden shadow-sm mb-6 group">
    <div className="md:flex md:items-stretch">
      <div className="md:w-2/5 h-56 sm:h-72 md:h-auto relative overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-bold backdrop-blur-sm">
            <Star size={11} className="text-amber-400" /> Featured Project
          </span>
        </div>
      </div>

      <div className="md:w-3/5 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge status={project.status} />
            <span className="text-gray-200">·</span>
            <LangDot color={project.langColor} name={project.language} />
            <span className="text-gray-200">·</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={11} /> {project.lastActivity}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
            {project.title}
          </h3>
          <p className="text-[#f4511e] font-semibold text-sm mb-4">{project.tagline}</p>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((t) => <TechPill key={t} tech={t} />)}
          </div>
        </div>

        <div>
          <div className="flex flex-wrap gap-5 text-sm text-gray-400 mb-6 pb-6 border-b border-gray-100">
            <span className="flex items-center gap-1.5">
              <Users size={14} className="text-[#5b9fff]" />
              <strong className="text-gray-900">{project.stats.contributors}</strong> contributors
            </span>
            <span className="flex items-center gap-1.5">
              <GitPullRequest size={14} className="text-[#5b9fff]" />
              <strong className="text-gray-900">{project.stats.prs}</strong> PRs merged
            </span>
            <span className="flex items-center gap-1.5">
              <AlertCircle size={14} className="text-[#f4511e]" />
              <strong className="text-gray-900">{project.stats.openIssues}</strong> open issues
            </span>
            <span className="flex items-center gap-1.5">
              <Star size={14} className="text-amber-400" />
              <strong className="text-gray-900">{project.stats.stars}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <GitFork size={14} className="text-gray-300" />
              <strong className="text-gray-900">{project.stats.forks}</strong>
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <NavLink
              to={`/projects/${project.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-bold transition-colors"
              style={{ background: "#2b7fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1a6fef")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2b7fff")}
            >
              View Project <ArrowUpRight size={14} />
            </NavLink>
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition-colors"
              style={{ borderColor: "#c5d9ff", color: "#2b7fff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background  = "#2b7fff";
                e.currentTarget.style.color       = "#fff";
                e.currentTarget.style.borderColor = "#2b7fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background  = "transparent";
                e.currentTarget.style.color       = "#2b7fff";
                e.currentTarget.style.borderColor = "#c5d9ff";
              }}
            >
              <Github size={14} /> Contribute
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─── Project Card 
const ProjectCard = ({ project }: { project: Projects }) => (
  <Card hover className="flex flex-col group">
    <div className="h-44 overflow-hidden rounded-t-2xl relative">
      <img
        src={project.image}
        alt={project.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3">
        <StatusBadge status={project.status} />
      </div>
    </div>

    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-3">
        <LangDot color={project.langColor} name={project.language} />
        <span className="text-gray-200">·</span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={10} /> {project.lastActivity}
        </span>
      </div>

      <h4 className="font-black text-gray-900 text-lg tracking-tight mb-1 group-hover:text-primary-colour transition-colors">
        {project.title}
      </h4>
      <p className="text-[#f4511e] text-xs font-semibold mb-3">{project.tagline}</p>
      <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">{project.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.techStack.slice(0, 3).map((t) => <TechPill key={t} tech={t} />)}
        {project.techStack.length > 3 && (
          <span className="px-2 py-1 text-xs text-gray-400 font-mono">
            +{project.techStack.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 pb-4 border-b border-gray-100">
        <span className="flex items-center gap-1">
          <Users size={12} className="text-[#5b9fff]" />
          <strong className="text-gray-900">{project.stats.contributors}</strong>
        </span>
        <span className="flex items-center gap-1">
          <GitPullRequest size={12} className="text-[#5b9fff]" />
          <strong className="text-gray-900">{project.stats.prs}</strong>
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle size={12} className="text-[#f4511e]" />
          <strong className="text-gray-900">{project.stats.openIssues}</strong> open
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Star size={12} className="text-amber-400" />
          <strong className="text-gray-900">{project.stats.stars}</strong>
        </span>
      </div>

      <div className="flex gap-2">
        <NavLink
          to={`/projects/${project.slug}`}
          className="flex-1 flex items-center justify-center py-2.5 rounded-full text-white text-xs font-bold transition-colors"
          style={{ background: "#2b7fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#1a6fef")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#2b7fff")}
        >
          View Project
        </NavLink>
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-colors"
        >
          <Github size={15} />
        </a>
      </div>
    </div>
  </Card>
);

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
        <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${ISSUE_LABEL_STYLES[issue.label]}`}>
          {issue.label}
        </span>
        <span className="text-gray-300 text-xs">·</span>
        <span className="text-xs text-gray-400 font-mono">{issue.project}</span>
        <span className="text-gray-300 text-xs">·</span>
        <span className={`text-xs font-bold ${DIFFICULTY_STYLES[issue.difficulty]}`}>
          {issue.difficulty}
        </span>
      </div>
    </div>
    <ExternalLink size={13} className="text-gray-300 group-hover:text-primary-colour transition-colors shrink-0 mt-0.5" />
  </a>
);

// ─── Page
const Projectt = () => {
  const { projects, loading, error } = useProjects();

  // ── Filter hook — replaces all the inline useState filter logic
  const {
    filtered,
    search,
    setSearch,
    filters,
    setFilter,
    clearAll,
    hasActiveFilters,
  } = useFilter<Projects, { category: ProjectCategory; status: ProjectStatus | "all" }>({
    items:      projects,
    searchKeys: ["title", "description", "techStack"],
    filterKeys: ["category", "status"],
  });

  const featured    = projects.find((p) => p.featured);
  const nonFeatured = filtered.filter((p) => !p.featured);

  // Only show featured card when no filters are active
  const showFeatured = !hasActiveFilters && !!featured;

  // Quick stats derived from fetched projects
  const totalOpenIssues    = projects.reduce((a, p) => a + p.stats.openIssues, 0);
  const totalContributors  = projects.reduce((a, p) => a + p.stats.contributors, 0);

  return (
    <>
      

      {/* ── Hero */}
      <section
        className="pt-32 pb-0 px-6 md:px-20 relative overflow-hidden"
        style={{ background: "#0a0f1e" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div
          className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(43,127,255,0.12) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto">
          <EyebrowLabel text=" Open Source Projects" align="left"/>

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
                Every project here solves a real problem in Rwanda or beyond.
                Pick one, claim an issue, and ship something you can point to.
              </p>
            </div>

            {/* Stats — derived from PROJECTS constant, always accurate */}
            <div className="grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden shrink-0">
              {[
                { n: projects.length,    label: "Projects"     },
                { n: totalOpenIssues,    label: "Open Issues"  },
                { n: totalContributors,  label: "Contributors" },
              ].map((s) => (
                <div key={s.label} className="bg-white/5 px-6 py-5 text-center">
                  <p className="text-2xl font-black text-white">{s.n}</p>
                  <p className="text-xs text-white/40 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search + status filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-0">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
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
              {(["all", "active", "seeking", "new", "maintenance"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter("status", s)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize hover:cursor-pointer"
                  style={
                    filters.status === s
                      ? { background: "#2b7fff", color: "#fff" }
                      : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }
                  }
                >
                  {s === "all" ? "All" : STATUS_META[s as ProjectStatus]?.label ?? s}
                </button>
              ))}
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
                    : { borderColor: "transparent", color: "rgba(255,255,255,0.35)" }
                }
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Project list */}
      <section className="py-12 px-6 md:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">

          {loading ? (
            <Loader />
          ) : error ? (
            <div className="text-center py-24 text-gray-400">
              <Code2 size={36} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-red-500">Couldn't load projects.</p>
              <p className="text-sm mt-1 text-gray-500">{error}</p>
            </div>
          ) : (
            <>
              {/* Featured card — only when no filters active */}
              {showFeatured && featured && <FeaturedCard project={featured} />}

              {nonFeatured.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {nonFeatured.map((p) => (
                    <ProjectCard key={p.id} project={p} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 text-gray-400">
                  <Code2 size={36} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold text-gray-500">No projects match that filter.</p>
                  <p className="text-sm mt-1 mb-6">Try clearing the search or switching categories.</p>
                  <button
                    onClick={clearAll}
                    className="px-5 py-2.5 rounded-full border text-sm font-semibold transition-colors"
                    style={{ borderColor: "#c5d9ff", color: "#2b7fff" }}
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Good first issues */}
      <section id="issues" className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          <div className="lg:col-span-2">
            <SectionLabel color="#f4511e">Good First Issues</SectionLabel>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 leading-snug">
              Start here
              <br />if you're new.
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              These issues are scoped, documented, and have a maintainer
              ready to review your PR within 48 hours. No experience needed.
            </p>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100 mb-6">
              <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-green-800 text-xs leading-relaxed">
                <strong>Every issue below has been written so a beginner can understand
                what needs to be done.</strong> Pick one, fork the repo, and open your first PR.
              </p>
            </div>
            <a
              href="https://github.com/opensourcekigali"
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

          {/* Issue list — comes from GOOD_FIRST_ISSUES constant */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-gray-100">
              <p className="text-sm font-black text-gray-900">Open Issues</p>
              <span className="text-xs font-mono text-gray-400">
                {GOOD_FIRST_ISSUES.length} issues
              </span>
            </div>
            {GOOD_FIRST_ISSUES.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Propose a project */}
      <section
        className="py-20 px-6 md:px-20 relative overflow-hidden"
        style={{ background: "#0a0f1e" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.055) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(244,81,30,0.08) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          <div className="max-w-xl">
            <Badge variant="live" dot className="mb-6">
              Always accepting new ideas
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
              Got a project idea that
              <br />
              <span style={{ color: "#fb923c" }}>solves something real?</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed">
              OSK incubates open-source projects that address genuine challenges
              in Rwanda and Africa. Bring your idea — we'll help you build a team.
            </p>
          </div>

          <div
            className="rounded-2xl p-7 min-w-72shrink-0 w-full lg:w-auto max-w-sm border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <p className="text-white font-bold text-sm mb-5">
              What a good proposal needs:
            </p>
            <div className="space-y-3">
              {[
                "A real problem that exists in Rwanda or Africa",
                "A rough idea of how software can help",
                "Willingness to be the first maintainer",
                "At least one other person to co-build with",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <Zap size={13} className="text-[#fb923c] shrink-0 mt-0.5" />
                  <p className="text-white/60 text-sm leading-snug">{item}</p>
                </div>
              ))}
            </div>
            <a
              href="opensourcekigali@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 mt-7 rounded-xl text-white text-sm font-bold transition-colors"
              style={{ background: "#2b7fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1a6fef")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#2b7fff")}
            >
              Submit a Proposal <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Projectt;