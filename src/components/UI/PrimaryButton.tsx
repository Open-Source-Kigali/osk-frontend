import { NavLink } from "react-router";
import React from "react";

type PrimaryButtonProps = {
  to: string;
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
  newTab?: boolean;
};

const PrimaryButton = ({
  to,
  children,
  className = "",
  newTab = false,
}: PrimaryButtonProps) => {
  const classes = `flex items-center justify-center gap-2 text-sm sm:text-base px-5 py-2.5 md:px-7 md:py-3.5 bg-primary-colour hover:bg-brand-500 hover:scale-95 text-white font-semibold rounded-full transition ${className}`;

  if (newTab || to.startsWith("http")) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <NavLink to={to} className={classes}>
      {children}
    </NavLink>
  );
};

export default PrimaryButton;
