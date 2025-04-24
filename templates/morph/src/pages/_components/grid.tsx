import { cn } from "@/pages/_lib/utils";
import * as React from "react";

export type GridProps = {
  cols: "1" | "2" | "3" | "4" | "5" | "6";
  children: React.ReactNode;
  className?: string;
};

const colClasses = {
  "1": "sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1",
  "2": "sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2",
  "3": "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3",
  "4": "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4",
  "5": "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  "6": "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
};

const Grid: React.FC<GridProps> = ({ cols, children, className }) => {
  // Tailwind CSSでの列数のクラスを動的に生成
  const baseClasses = "grid gap-3";
  const responsiveClasses = colClasses[cols];

  return (
    <div className={cn([baseClasses, responsiveClasses, className])}>
      {children}
    </div>
  );
};

export { Grid };
