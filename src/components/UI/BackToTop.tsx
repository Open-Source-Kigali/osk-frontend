import { ChevronUp } from "lucide-react";
import { useScrolled } from "../../hooks/useScrolled";

const BackToTop = () => {
  const scrolled = useScrolled(400);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!scrolled) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-primary-colour hover:bg-brand-500 text-white rounded-full shadow-lg transition-transform hover:scale-110 z-50 flex items-center justify-center"
      aria-label="Back to top"
    >
      <ChevronUp size={24} />
    </button>
  );
};

export default BackToTop;
