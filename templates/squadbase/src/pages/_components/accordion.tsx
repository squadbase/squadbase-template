import {
  Accordion as AccordionRoot,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/pages/_components/ui/accordion-primitive";
import { cn } from "@/pages/_lib/utils";
import { useState } from "react";

type AccordionProps = {
  title: string;
  defaultOpen?: boolean;
  className?: string;
};

const Accordion: React.FC<React.PropsWithChildren<AccordionProps>> = ({
  title,
  defaultOpen,
  children,
  className,
}) => {
  const [value] = useState(defaultOpen ? "item-1" : undefined);
  return (
    <AccordionRoot
      type="single"
      collapsible
      defaultValue={value}
      className={cn(["border px-4 rounded-lg hover:bg-gray-700/5", className])}
    >
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="py-3">
          <div>{title}</div>
        </AccordionTrigger>
        <AccordionContent>{children}</AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  );
};

export { Accordion };
