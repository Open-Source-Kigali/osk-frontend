import { useRouteError, isRouteErrorResponse, NavLink } from "react-router";
import SEO from "@/components/SEO";

const ErrorPage = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message = "An unexpected error occurred. Please try again.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      title = "Page Not Found";
      message = "The page you're looking for doesn't exist or has been moved.";
    } else {
      title = `${error.status} ${error.statusText}`;
      message = error.data?.message ?? message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <SEO
        title={title}
        description={message}
        noindex
      />
      <div className="text-center max-w-md">
        <h1 className="text-4xl md:text-5xl font-bold text-text-heading mb-4">
          {title}
        </h1>
        <p className="text-text-supporting mb-8">{message}</p>
        <NavLink
          to="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-colour text-white font-semibold rounded-full hover:bg-brand-500 transition"
        >
          Go back home
        </NavLink>
      </div>
    </main>
  );
};

export default ErrorPage;
