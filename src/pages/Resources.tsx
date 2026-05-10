import { NavLink } from "react-router";
import { Search, BookOpen, Play, Wrench, FileCode, Newspaper, Layout, Clock, ArrowUpRight, ExternalLink,  Github, Star, ChevronRight, Rss, Terminal, Globe, Youtube, PenLine,
} from "lucide-react";

import { useFilter } from "@/hooks";
import { useDebounce } from "@/hooks";
import { RESOURCES, EXTERNAL_TOOLS, LEARNING_PATHS } from "@/constants";
import type { Resource, ResourceType, ResourceCategory } from "@/types";
import EyebrowLabel from "../components/UI/EyebrowLable";

// ─── Meta maps — kept in the component file since they
//     contain JSX (icons) and are only used here ─────────────────────────────

const TYPE_META: Record<
  ResourceType,
  {
    label: string;
    icon: React.ReactNode;
    bg: string;
    text: string;
    border: string;
  }
> = {
  tutorial: {
    label: "Tutorial",
    icon: <BookOpen size={13} />,
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  guide: {
    label: "Guide",
    icon: <Newspaper size={13} />,
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
  },
  tool: {
    label: "Tool",
    icon: <Wrench size={13} />,
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  template: {
    label: "Template",
    icon: <Layout size={13} />,
    bg: "bg-teal-100",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  article: {
    label: "Article",
    icon: <PenLine size={13} />,
    bg: "bg-rose-100",
    text: "text-rose-700",
    border: "border-rose-200",
  },
  video: {
    label: "Video",
    icon: <Play size={13} />,
    bg: "bg-red-100",
    text: "text-red-600",
    border: "border-red-200",
  },
};

const DIFFICULTY_META: Record<
  Resource["difficulty"],
  { label: string; color: string }
> = {
  beginner: { label: "Beginner", color: "text-emerald-600" },
  intermediate: { label: "Intermediate", color: "text-amber-600" },
  advanced: { label: "Advanced", color: "text-red-500" },
};

const TYPE_FILTERS: { key: ResourceType | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "tutorial", label: "Tutorials" },
  { key: "guide", label: "Guides" },
  { key: "tool", label: "Tools" },
  { key: "template", label: "Templates" },
  { key: "article", label: "Articles" },
  { key: "video", label: "Videos" },
];

const CATEGORY_FILTERS: { key: ResourceCategory; label: string }[] = [
  { key: "all", label: "All topics" },
  { key: "git", label: "Git & GitHub" },
  { key: "javascript", label: "JavaScript" },
  { key: "python", label: "Python" },
  { key: "open-source", label: "Open Source" },
  { key: "design", label: "Design" },
  { key: "career", label: "Career" },
];

// Maps iconKey strings from the constant to actual React nodes
const TOOL_ICONS: Record<string, React.ReactNode> = {
  github: <Github size={18} />,
  vscode: <FileCode size={18} />,
  figma: <Layout size={18} />,
  vercel: <Globe size={18} />,
  postman: <Terminal size={18} />,
  youtube: <Youtube size={18} />,
};

// Maps LEARNING_PATHS color keys to Tailwind classes
const PATH_STYLES: Record<
  string,
  {
    border: string;
    bg: string;
    iconBg: string;
    label: string;
    numBg: string;
    numText: string;
    btn: string;
  }
> = {
  blue: {
    border: "border-blue-100",
    bg: "bg-blue-50",
    iconBg: "bg-blue-500",
    label: "text-blue-600",
    numBg: "bg-blue-200",
    numText: "text-blue-700",
    btn: "text-blue-600 hover:text-blue-800",
  },
  violet: {
    border: "border-violet-100",
    bg: "bg-violet-50",
    iconBg: "bg-violet-500",
    label: "text-violet-600",
    numBg: "bg-violet-200",
    numText: "text-violet-700",
    btn: "text-violet-600 hover:text-violet-800",
  },
  emerald: {
    border: "border-emerald-100",
    bg: "bg-emerald-50",
    iconBg: "bg-emerald-500",
    label: "text-emerald-600",
    numBg: "bg-emerald-200",
    numText: "text-emerald-700",
    btn: "text-emerald-600 hover:text-emerald-800",
  },
};

const PATH_ICONS: Record<string, React.ReactNode> = {
  terminal: <Terminal size={18} />,
  layout: <Layout size={18} />,
  rss: <Rss size={18} />,
};

// ─── Sub-components
const TypeBadge = ({ type }: { type: ResourceType }) => {
  const m = TYPE_META[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${m.bg} ${m.text} ${m.border}`}
    >
      {m.icon} {m.label}
    </span>
  );
};

const AuthorAvatar = ({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colors = [
    "bg-blue-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-rose-500",
    "bg-teal-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  const sz = size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sz} rounded-full ${color} flex items-center justify-center text-white font-bold shrink-0`}
    >
      {initials}
    </div>
  );
};

// ─── Featured Card
const FeaturedResourceCard = ({ resource }: { resource: Resource }) => (
  <div className="bg-brand-950 rounded-2xl overflow-hidden border border-brand-950 mb-8">
    <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
      <div className="md:col-span-1 flex md:flex-col gap-3 md:gap-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-950 border border-brand-300 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-300" />
          <span className="text-brand-300 text-xs font-bold uppercase tracking-wider">
            Featured
          </span>
        </div>
        <div className="hidden md:block border-t border-brand-50 pt-4 space-y-3">
          <div className="flex items-center gap-2 text-brand-50 text-sm">
            <Clock size={16} /> {resource.readTime}
          </div>
          <div
            className={`text-sm font-bold ${DIFFICULTY_META[resource.difficulty].color}`}
          >
            {DIFFICULTY_META[resource.difficulty].label}
          </div>
          <div className="flex items-center gap-1.5 text-brand-50 text-xs">
            <Star size={14} /> {resource.views.toLocaleString()} views
          </div>
        </div>
      </div>

      <div className="md:col-span-3">
        <TypeBadge type={resource.type} />
        <h2 className="text-2xl sm:text-3xl font-black text-brand-50 leading-tight mt-4 mb-3">
          {resource.title}
        </h2>
        <p className="text-brand-100 text-base leading-relaxed mb-6">
          {resource.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-full text-brand-50 text-xs font-mono border border-brand-400"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <AuthorAvatar name={resource.author} size="md" />
          <div>
            <p className="text-white text-sm font-bold">{resource.author}</p>
            <p className="text-brand-50 text-xs">
              {resource.authorRole} · {resource.date}
            </p>
          </div>
        </div>
      </div>

      <div className="md:col-span-1 flex md:flex-col gap-3 items-start md:items-stretch">
        <a
          href={resource.link}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-primary-colour hover:opacity-90 text-white text-sm font-bold rounded-xl transition-colors"
        >
          Read now <ArrowUpRight size={14} />
        </a>
        <a
          href={resource.link}
          className="flex items-center justify-center gap-2 px-5 py-3 border border-primary-colour text-brand-50 hover:text-primary-colour text-sm font-semibold rounded-xl transition-colors"
        >
          Save for later
        </a>
      </div>
    </div>
  </div>
);

// ─── Resource Card
const ResourceCard = ({ resource }: { resource: Resource }) => (
  <a
    href={resource.link}
    className="group bg-white rounded-2xl border border-gray-200 p-5 flex flex-col hover:border-primary-colour hover:shadow-md transition-all duration-200"
  >
    <div className="flex items-center justify-between mb-4">
      <TypeBadge type={resource.type} />
      <span
        className={`text-xs font-bold ${DIFFICULTY_META[resource.difficulty].color}`}
      >
        {DIFFICULTY_META[resource.difficulty].label}
      </span>
    </div>

    <h3 className="text-base font-black text-gray-900 leading-snug mb-2 group-hover:text-primary-colour transition-colors">
      {resource.title}
    </h3>
    <p className="text-gray-500 text-sm leading-relaxed mb-4 flex-1">
      {resource.description}
    </p>

    <div className="flex flex-wrap gap-1.5 mb-4">
      {resource.tags.slice(0, 3).map((tag) => (
        <span
          key={tag}
          className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-mono"
        >
          #{tag}
        </span>
      ))}
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <AuthorAvatar name={resource.author} />
        <div>
          <p className="text-gray-700 text-xs font-semibold">
            {resource.author}
          </p>
          <p className="text-gray-400 text-xs">{resource.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-gray-400 text-xs">
        <span className="flex items-center gap-1">
          <Clock size={11} /> {resource.readTime}
        </span>
        <ChevronRight
          size={14}
          className="group-hover:translate-x-0.5 transition-transform"
        />
      </div>
    </div>
  </a>
);

// ─── Page
const Resources = () => {
  // ── useFilter replaces the three useState + manual .filter() chain ─────────
  const {
    filtered: allFiltered,
    search,
    setSearch,
    filters,
    setFilter,
    clearAll,
  } = useFilter<
    Resource,
    { type: ResourceType | "all"; category: ResourceCategory }
  >({
    items: RESOURCES,
    searchKeys: ["title", "description", "tags", "author"],
    filterKeys: ["type", "category"],
  });

  // Debounce the search input
  const debouncedSearch = useDebounce(search, 250);
  void debouncedSearch; // used internally by useFilter via search state

  const featured = RESOURCES.find((r) => r.featured)!;
  const nonFeatured = allFiltered.filter((r) => !r.featured);

  

  return (
    <>
      {/* ── HERO */}
      <section
        className="pt-32 pb-16 px-6 md:px-20 relative overflow-hidden"
        style={{
          background: "linear-gradient(150deg, #f0f4ff 0%, #ffffff 60%)",
        }}
      >
        <div
          className="absolute w-80 h-80 rounded-full -top-16 -left-16 pointer-events-none"
          style={{ background: "#dbeafe", filter: "blur(60px)", opacity: 0.5 }}
        />
        <div
          className="absolute w-60 h-60 rounded-full top-10 right-10 pointer-events-none"
          style={{ background: "#ede9fe", filter: "blur(50px)", opacity: 0.4 }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="max-w-3xl mb-10">
            <EyebrowLabel text="OSK Library" align="left" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 leading-none tracking-tight mb-5">
              Everything you need
              <br />
              <span className="text-primary-colour">
                to start contributing.
              </span>
            </h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-xl">
              Tutorials, guides, templates, tools, and recorded sessions — all
              written by OSK contributors, for OSK contributors. Practical.
              Rwanda-specific. Free.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tutorials, guides, tools..."
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:border-primary-colour focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-semibold"
              >
                clear
              </button>
            )}
          </div>

          
        </div>
      </section>

      {/* ── FEATURED */}
      <section className="px-6 md:px-20 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <FeaturedResourceCard resource={featured} />
        </div>
      </section>

      {/* ── FILTER + GRID */}
      <section className="px-6 md:px-20 py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-4 mb-10">
            {/* Type tabs */}
            <div className="flex gap-0 overflow-x-auto border-b border-gray-200">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter("type", f.key)}
                  className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 transition-colors duration-200 -mb-px ${
                    filters.type === f.key
                      ? "border-primary-colour text-primary-colour"
                      : "border-transparent text-gray-400 hover:text-primary-colour"
                  }`}
                >
                  {f.label}
                  {f.key !== "all" && (
                    <span className="ml-1.5 text-xs text-gray-400 font-normal">
                      ({RESOURCES.filter((r) => r.type === f.key).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Category pills + result count */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORY_FILTERS.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter("category", f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                      filters.category === f.key
                        ? "bg-primary-colour text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-primary-colour hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <p className="text-gray-500 text-sm">
                {nonFeatured.length} resource
                {nonFeatured.length !== 1 ? "s" : ""}
                {search && ` for "${search}"`}
              </p>
            </div>
          </div>

          {/* Grid */}
          {nonFeatured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {nonFeatured.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <BookOpen size={36} className="mx-auto mb-4 text-gray-300" />
              <p className="font-bold text-gray-500 mb-1">
                No resources found.
              </p>
              <p className="text-gray-400 text-sm">
                Try a different search term or clear your filters.
              </p>
              <button
                onClick={clearAll}
                className="mt-5 px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── EXTERNAL TOOLS */}
      <section className="px-6 md:px-20 py-20 bg-blue-50 border-t border-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <EyebrowLabel text="Curated tools" align="left" />
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
                The tools every
                <br />
                OSK contributor uses.
              </h2>
            </div>
            <p className="text-gray-500 text-base max-w-xs md:text-right leading-relaxed">
              Hand-picked by maintainers. Everything here is free and
              battle-tested across OSK projects.
            </p>
          </div>

          {/* Tools from EXTERNAL_TOOLS constant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXTERNAL_TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-blue-100 p-5 flex items-start gap-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-gray-500 shrink-0 group-hover:text-primary-colour transition-colors">
                  {TOOL_ICONS[tool.iconKey]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-black text-gray-900 text-sm">
                      {tool.name}
                    </p>
                    <ExternalLink
                      size={12}
                      className="text-gray-300 group-hover:text-gray-600 transition-colors shrink-0"
                    />
                  </div>
                  <p className="text-gray-500 text-xs leading-relaxed mb-2">
                    {tool.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium">
                      {tool.category}
                    </span>
                    {tool.free && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                        Free
                      </span>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── LEARNING PATHS */}
      <section className="px-6 md:px-20 py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <EyebrowLabel text="Where to start" align="left" />
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Not sure what to read first?
            </h2>
          </div>

          {/* Paths from LEARNING_PATHS constant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {LEARNING_PATHS.map((path) => {
              const styles = PATH_STYLES[path.color];
              return (
                <div
                  key={path.key}
                  className={`rounded-2xl border-2 ${styles.border} ${styles.bg} p-7`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${styles.iconBg} flex items-center justify-center text-white mb-5`}
                  >
                    {PATH_ICONS[path.icon]}
                  </div>
                  <p
                    className={`text-xs font-bold uppercase tracking-wider mb-2 ${styles.label}`}
                  >
                    {path.label}
                  </p>
                  <h3 className="text-lg font-black text-gray-900 mb-3 leading-snug whitespace-pre-line">
                    {path.heading}
                  </h3>
                  <ol className="space-y-2 mb-6">
                    {path.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <span
                          className={`w-5 h-5 rounded-full ${styles.numBg} ${styles.numText} flex items-center justify-center text-xs font-black shrink-0 mt-0.5`}
                        >
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ol>
                  <button
                    onClick={() => {
                      setFilter("type", path.filterType);
                      setFilter("category", path.filterCategory);
                    }}
                    className={`text-sm font-bold flex items-center gap-1 transition-colors hover:cursor-pointer ${styles.btn}`}
                  >
                    Start this path <ChevronRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SUBMIT A RESOURCE */}
      <section className="px-6 md:px-20 py-20 bg-gray-900 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-14">
          <div className="max-w-xl">
            <EyebrowLabel text="Open to submissions" align="left" />
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-5">
              Built something useful?
              <br />
              <span className="text-primary-colour">Teach the Community.</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed">
              The best resources on this page were written by OSK contributors —
              not staff. If you've learned something the hard way, write it up
              and share it. A good tutorial saves the next ten people your pain.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 min-w-72 shrink-0 w-full lg:w-auto max-w-sm">
            <h3 className="text-lg font-black text-gray-900 mb-2">
              Submit a resource
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Tutorials, guides, templates, recorded sessions — anything that
              helps someone contribute better.
            </p>

            <div className="space-y-3 mb-6">
              {[
                {
                  icon: <BookOpen size={14} />,
                  label: "Write a tutorial or guide",
                },
                {
                  icon: <Layout size={14} />,
                  label: "Share a template or starter",
                },
                {
                  icon: <Play size={14} />,
                  label: "Submit a recorded session",
                },
                { icon: <Wrench size={14} />, label: "Recommend a tool" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-sm text-gray-900"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    {item.icon}
                  </div>
                  {item.label}
                </div>
              ))}
            </div>

            <a
              href="mailto:opensourcekigali@gmail.com?subject=Resource Submission"
              className="flex items-center justify-center gap-2 w-full py-3 bg-primary-colour hover:opacity-90 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Submit via email <ArrowUpRight size={14} />
            </a>
            <NavLink
              to="/community"
              className="flex items-center justify-center gap-2 w-full py-3 mt-2 border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-400 text-sm font-semibold rounded-xl transition-colors"
            >
              Or post in #resources on Discord
            </NavLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default Resources;
