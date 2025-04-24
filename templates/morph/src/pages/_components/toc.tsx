"use client";

import { LucideTableOfContents } from "lucide-react";
import { HoverCardContent } from "@radix-ui/react-hover-card";
import {
  HoverCard,
  HoverCardTrigger,
} from "@/pages/_components/ui/hover-card";
import { Card } from "@/pages/_components/ui/card";
import { Button } from "@/pages/_components/ui/button";
import { cn } from "@/pages/_lib/utils";

export interface TocEntry {
  value: string;
  depth: number;
  id?: string;
  children?: Array<TocEntry>;
}

export type Toc = Array<TocEntry>;

export interface TocProps {
  toc?: Toc;
  className?: string;
}

export const Toc: React.FC<TocProps> = ({ toc, className }) => {
  if (!toc) {
    return null;
  }

  return (
    <>
      <div className={cn("toc text-sm w-full hidden lg:block", className)}>
        <div className="grid gird-cols-1 gap-2.5 w-full">
          {toc.map((entry) => (
            <a className="x-underline" href={`#${entry.id}`} key={entry.id}>
              <div
                key={entry.id}
                className="text-zinc-400 hover:text-zinc-900 cursor-pointer font-normal decoration-zinc-400 decoration-0 line-clamp-2"
              >
                <span className="">{entry.value}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className={cn("toc text-sm w-full lg:hidden", className)}>
        <HoverCard openDelay={300}>
          <HoverCardTrigger asChild>
            <Button variant="ghost">
              <LucideTableOfContents />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-[16rem]">
            <Card>
              <div className="grid gird-cols-1 gap-2.5 w-full">
                {toc.map((entry) => (
                  <a
                    className="x-underline"
                    href={`#${entry.id}`}
                    key={entry.id}
                  >
                    <div
                      key={entry.id}
                      className="text-zinc-400 hover:text-zinc-900 cursor-pointer font-normal decoration-zinc-400 decoration-0 line-clamp-2"
                    >
                      {entry.value}
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </HoverCardContent>
        </HoverCard>
      </div>
    </>
  );
};
