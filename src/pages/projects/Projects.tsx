import GoodFirstIssues from "@/components/projects/GoodFirstIssues";
import Hero from "@/components/projects/Hero";
import ProjectsList from "@/components/projects/ProjectsList";
import ProposeAProject from "@/components/projects/ProposeAProject";
import LoadingSpinner from "@/components/UI/LoadingSpinner";
import { useFilter, useProjects } from "@/hooks";
import type { ProjectCategory, Projects, ProjectStatus } from "@/types";

// ─── Page
const Project = () => {
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
  } = useFilter<
    Projects,
    { category: ProjectCategory; status: ProjectStatus | "all" }
  >({
    items: projects,
    searchKeys: ["title", "description", "techStack"],
    filterKeys: ["category", "status"],
  });

  const featured = projects.find((p) => p.featured);
  const nonFeatured = filtered.filter((p) => !p.featured);

  // Only show featured card when no filters are active
  const showFeatured = !hasActiveFilters && !!featured;

  // Quick stats derived from fetched projects
  const totalOpenIssues = projects.reduce((a, p) => a + p.stats.openIssues, 0);
  const totalContributors = projects.reduce(
    (a, p) => a + p.stats.contributors,
    0,
  );
  //handle loading status
  if (loading) {
    return <LoadingSpinner page="projects" />;
  }

  return (
    <>
      {/* ── Hero */}
      <Hero
        totalProjects={projects.length}
        totalOpenIssues={totalOpenIssues}
        totalContributors={totalContributors}
        search={search}
        setSearch={setSearch}
        setFilter={setFilter}
        filters={filters}
      />

      {/* ── Project list */}
      <ProjectsList
        loading={loading}
        error={error}
        showFeatured={showFeatured}
        featured={featured}
        nonFeatured={nonFeatured}
        clearAll={clearAll}
      />

      {/* ── Good first issues */}
      <GoodFirstIssues />

      {/* ── Propose a project */}
      <ProposeAProject />
    </>
  );
};

export default Project;
