import type { Projects, ProjectStatus } from "@/types";
import {
  AlertCircle,
  ArrowUpRight,
  Clock,
  Code2,
  GitFork,
  Github,
  GitPullRequest,
  Star,
  Users,
} from "lucide-react";
import { NavLink } from "react-router";
import { Card, Loader } from "../UI";
import { ScrollAnimatedItem } from "../UI/ScrollAnimatedItem";

interface ProjectsListProps {
  // projects: Projects[];
  loading: boolean;
  error: null | string;
  showFeatured: boolean;
  featured: Projects | undefined;
  nonFeatured: Projects[];
  clearAll: () => void;
}

// ─── Meta maps
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
          <p className="text-[#f4511e] font-semibold text-sm mb-4">
            {project.tagline}
          </p>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((t) => (
              <TechPill key={t} tech={t} />
            ))}
          </div>
        </div>

        <div>
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
              <strong className="text-gray-900">{project.stats.prs}</strong> PRs
              merged
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#1a6fef")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#2b7fff")
              }
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
      <p className="text-[#f4511e] text-xs font-semibold mb-3">
        {project.tagline}
      </p>
      <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {project.techStack.slice(0, 3).map((t) => (
          <TechPill key={t} tech={t} />
        ))}
        {project.techStack.length > 3 && (
          <span className="px-2 py-1 text-xs text-gray-400 font-mono">
            +{project.techStack.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 pb-4 border-b border-gray-100">
        <span className="flex items-center gap-1">
          <Users size={12} className="text-[#5b9fff]" />
          <strong className="text-gray-900">
            {project.stats.contributors}
          </strong>
        </span>
        <span className="flex items-center gap-1">
          <GitPullRequest size={12} className="text-[#5b9fff]" />
          <strong className="text-gray-900">{project.stats.prs}</strong>
        </span>
        <span className="flex items-center gap-1">
          <AlertCircle size={12} className="text-[#f4511e]" />
          <strong className="text-gray-900">
            {project.stats.openIssues}
          </strong>{" "}
          open
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

const ProjectsList = ({
  error,
  loading,
  showFeatured,
  featured,
  nonFeatured,
  clearAll,
}: ProjectsListProps) => {
  return (
    <section className="py-12 px-6 md:px-20 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-24 text-gray-400">
            <Code2 size={36} className="mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-red-500">
              Couldn't load projects.
            </p>
            <p className="text-sm mt-1 text-gray-500">{error}</p>
          </div>
        ) : (
          <>
            {/* Featured card — only when no filters active */}
            {showFeatured && featured && <FeaturedCard project={featured} />}

            {nonFeatured.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {nonFeatured.map((p, idx) => (
                  <ScrollAnimatedItem key={p.id} delay={idx * 0.15}>
                    <ProjectCard project={p} />
                  </ScrollAnimatedItem>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <Code2 size={36} className="mx-auto mb-4 opacity-30" />
                <p className="font-semibold text-gray-500">
                  No projects match that filter.
                </p>
                <p className="text-sm mt-1 mb-6">
                  Try clearing the search or switching categories.
                </p>
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
  );
};

export default ProjectsList;
