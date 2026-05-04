interface LoaderProps {
  text?:    string;
  size?:    number;
  fullPage?: boolean;
}

const Loader = ({ text = "Loading...", size = 48, fullPage = false }: LoaderProps) => {
  const wrapper = fullPage
    ? "min-h-[60vh] flex flex-col items-center justify-center"
    : "flex flex-col items-center justify-center py-16";

  return (
    <div className={wrapper}>
      <span
        className="rounded-full border-4 border-blue-100 border-t-primary-colour animate-spin"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      <p className="mt-4 text-sm font-semibold text-primary-colour">{text}</p>
    </div>
  );
};

export default Loader;
