import type { ReactNode, FC, RefObject } from "react";
import { useScrollAnimation } from "@/hooks";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export const ScrollAnimatedItem: FC<Props> = ({ children, delay = 0, className = "" }) => {
  const ref = useScrollAnimation();
  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={`opacity-0 ${className}`}
      style={delay ? { animationDelay: `${delay}s` } : {}}
    >
      {children}
    </div>
  );
};
