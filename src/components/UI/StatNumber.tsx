import React from "react";
import { SlidingNumber } from "@/components/animate-ui/primitives/texts/sliding-number";
import { cn } from "@/lib/utils";

export interface StatNumberProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  className?: string;
  delay?: number;
}

export const StatNumber: React.FC<StatNumberProps> = ({
  value,
  prefix = "",
  suffix = "",
  className = "",
  delay = 0,
}) => {
  const strVal = String(value ?? 0);
  const match = strVal.match(/\d+/);

  if (!match) {
    return <span className={className}>{value}</span>;
  }

  const num = parseInt(match[0], 10);
  const hasPlusPrefix = prefix === "+" || strVal.startsWith("+");
  const hasPlusSuffix = suffix === "+" || strVal.endsWith("+");

  return (
    <span className={cn("inline-flex items-center tabular-nums", className)}>
      {hasPlusPrefix && <span className="select-none">+</span>}
      <SlidingNumber
        number={num}
        fromNumber={0}
        inView={true}
        inViewOnce={true}
        delay={delay}
        thousandSeparator=","
        transition={{ stiffness: 120, damping: 24, mass: 0.6 }}
      />
      {hasPlusSuffix && <span className="select-none">+</span>}
    </span>
  );
};
