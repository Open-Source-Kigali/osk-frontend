import React from "react";
import { useScrollAnimation } from "@/hooks";

interface Props {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const ScrollAnimatedItem: React.FC<Props> = ({ children, delay = 0, className = "" }) => {
  const ref = useScrollAnimation();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`opacity-0 ${className}`}
      style={delay ? { animationDelay: `${delay}s` } : {}}
    >
      {children}
    </div>
  );
};
