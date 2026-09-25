import React from "react";

type PrimaryButtonProps = {
  to: string;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
  popup?: boolean;
};

const PrimaryButton = ({
  to,
  children,
  className = "",
  popup = false,
}: PrimaryButtonProps) => {
  const isExternal = to.startsWith("http") || to.startsWith("mailto:");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (popup) {
      e.preventDefault();

      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      window.open(
        to,
        "GmailPopup",
        `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
      );
    }
  };

  return (
    <a
      target={isExternal && !popup ? "_blank" : undefined} // Skip target="_blank" if it's a popup
      rel={isExternal ? "noopener noreferrer" : undefined}
      href={to}
      onClick={handleClick} 
      className={`flex items-center justify-center gap-2 text-sm sm:text-base px-5 py-2.5 md:px-7 md:py-3.5 bg-primary-colour hover:bg-brand-500 hover:scale-[1.05] hover:shadow-lg text-white font-semibold rounded-full transition ${className}`}
    >
      {children}
    </a>
  );
};

export default PrimaryButton;