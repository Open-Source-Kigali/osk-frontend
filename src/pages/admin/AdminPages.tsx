import AdminPlaceholder from "./AdminPlaceholder";

export function AdminReviewsPage() {
  return (
    <AdminPlaceholder
      title="Reviews"
      description="Testimonial moderation will be added in a later update. This page does not approve or reject reviews yet."
    />
  );
}

export function AdminNotFoundPage() {
  return (
    <AdminPlaceholder
      title="Page not available"
      description="This address does not match an admin section. Choose a section from the navigation above."
    />
  );
}
