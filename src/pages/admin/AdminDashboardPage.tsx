import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiGet, fetchStats, sessionGet } from "@/api";
import {
  applicationDetail,
  countMetric,
  dashboardSessionExpired,
  emptyDetail,
  initialDashboard,
  loadAdminDashboard,
  presentCount,
  problemMessages,
  projectDetail,
  SESSION_EXPIRED_MESSAGE,
  type AdminDashboardSnapshot,
  type Metric,
} from "@/admin/dashboard";
import { Button } from "@/components/UI";

const dashboardClient = {
  getStats: () => fetchStats(),
  getMembers: () => apiGet<unknown>("/members"),
  getApplications: () => sessionGet<unknown>("/partner-applications"),
  getPendingReviews: () => sessionGet<unknown>("/admin/reviews?status=PENDING"),
};

const AdminDashboardPage = () => {
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot>(initialDashboard);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    let active = true;
    void loadAdminDashboard(dashboardClient).then((next) => {
      if (!active) return;
      setSnapshot(next);
      setBusy(false);
    });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function refresh() {
    setSnapshot(initialDashboard());
    setBusy(true);
    setReloadKey((value) => value + 1);
  }

  const problems = problemMessages(snapshot);
  const sessionExpired = dashboardSessionExpired(snapshot);
  const communityReady = snapshot.community.status === "ready" ? snapshot.community.data : null;
  const applicationsReady =
    snapshot.applications.status === "ready" ? snapshot.applications.data : null;

  return (
    <section className="flex flex-col gap-6" data-testid="admin-dashboard">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
            These counts come from the API. Open a section to see its records.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" loading={busy} onClick={refresh}>
          {busy ? "Refreshing counts..." : "Refresh counts"}
        </Button>
      </div>

      {sessionExpired ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900"
        >
          {SESSION_EXPIRED_MESSAGE} Protected counts stay hidden.{" "}
          <Link to="/admin/login" className="font-semibold underline">
            Sign in again
          </Link>
        </p>
      ) : null}

      {problems.map((message) => (
        <p
          key={message}
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {message}
        </p>
      ))}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <CountCard
          title="Events"
          to="/admin/events"
          metric={countMetric(snapshot.community, (data) => data.events)}
          detail={
            communityReady
              ? emptyDetail(communityReady.events, "No events yet.", "Event records.")
              : "Event records."
          }
        />
        <CountCard
          title="Projects"
          to="/admin/projects"
          metric={countMetric(snapshot.community, (data) => data.projects)}
          detail={communityReady ? projectDetail(communityReady) : "Project records."}
        />
        <CountCard
          title="Partners"
          to="/admin/partners"
          metric={countMetric(snapshot.community, (data) => data.partners)}
          detail={
            communityReady
              ? emptyDetail(communityReady.partners, "No partners yet.", "Partner records.")
              : "Partner records."
          }
        />
        <CountCard
          title="Members"
          to="/admin/members"
          metric={snapshot.members}
          detail={
            snapshot.members.status === "ready"
              ? emptyDetail(snapshot.members.data, "No member records yet.", "Member records.")
              : "Member records."
          }
        />
        <CountCard
          title="Partner applications"
          to="/admin/partner-applications"
          metric={countMetric(snapshot.applications, (data) => data.total)}
          detail={applicationsReady ? applicationDetail(applicationsReady) : "Submitted applications."}
        />
        <CountCard
          title="Approved reviews"
          to="/admin/reviews"
          metric={countMetric(snapshot.community, (data) => data.approvedReviews)}
          detail={
            communityReady
              ? emptyDetail(
                  communityReady.approvedReviews,
                  "No approved reviews yet.",
                  "Approved testimonials.",
                )
              : "Approved testimonials."
          }
        />
        <CountCard
          title="Pending reviews"
          to="/admin/reviews"
          metric={snapshot.pendingReviews}
          detail={
            snapshot.pendingReviews.status === "ready"
              ? emptyDetail(
                  snapshot.pendingReviews.data,
                  "No reviews are waiting.",
                  "Waiting for a decision.",
                )
              : "Waiting for a decision."
          }
        />
      </div>
    </section>
  );
};

function CountCard({
  title,
  to,
  metric,
  detail,
}: {
  title: string;
  to: string;
  metric: Metric<number>;
  detail: string;
}) {
  const presentation = presentCount(metric);

  return (
    <article className="flex min-h-40 flex-col rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-bold text-text-heading">{title}</h2>
      {presentation.state === "ready" ? (
        <p className="mt-3 text-3xl font-bold tabular-nums text-text-heading">{presentation.value}</p>
      ) : (
        <p
          className="mt-3 text-sm font-medium text-text-supporting"
          role={presentation.state === "loading" ? "status" : undefined}
        >
          {presentation.text}
        </p>
      )}
      <p className="mt-2 text-sm leading-6 text-text-supporting">{detail}</p>
      <Link
        to={to}
        className="mt-auto pt-4 text-sm font-semibold text-primary-colour hover:underline"
      >
        Open {title}
      </Link>
    </article>
  );
}

export default AdminDashboardPage;
