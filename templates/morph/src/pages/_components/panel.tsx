import * as React from "react";
import { LucideMaximize2, LucideMinimize2 } from "lucide-react";
import { Button } from "@/pages/_components/ui/button";
import { Card } from "@/pages/_components/ui/card";
import { cn } from "@/pages/_lib/utils";

export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement>,
  callback: (event: any) => void
) => {
  React.useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};

const Panel: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const ref = React.useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setIsExpanded(false));

  // const id = React.useId();

  const handleToggle = React.useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <>
      <div className={`${isExpanded ? "visible" : "hidden"}`}>
        <div className="fixed inset-0 bg-black/20 h-full w-full z-10" />
        <div className="fixed inset-8  grid place-items-center z-[100]">
          <div
            ref={ref}
            className="w-full h-full bg-white dark:bg-neutral-900 sm:rounded-xl overflow-hidden relative"
          >
            <div className="flex w-full items-end p-2 mb-[-1rem]">
              <div className="flex-1" />
              <Button variant="ghost" onClick={handleToggle}>
                <LucideMinimize2 size={16} />
              </Button>
            </div>
            <div className="relative p-4">{children}</div>
          </div>
        </div>
      </div>
      <Card className="p-0">
        <div
          onClick={handleToggle}
          className={cn([
            "p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer relative group",
            className,
          ])}
        >
          {children}
          <div className="absolute top-2 right-2 invisible group-hover:visible">
            <div className="flex-1" />
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              <LucideMaximize2 size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export { Panel };
