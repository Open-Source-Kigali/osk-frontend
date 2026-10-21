type AdminPlaceholderProps = {
  title: string;
  description: string;
};

const AdminPlaceholder = ({ title, description }: AdminPlaceholderProps) => {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-primary-colour">
        Admin
      </p>
      <h1 className="mt-2 text-2xl font-bold text-text-heading sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
        {description}
      </p>
    </section>
  );
};

export default AdminPlaceholder;
