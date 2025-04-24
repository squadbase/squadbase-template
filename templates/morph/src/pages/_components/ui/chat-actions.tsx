import React, {
  ComponentProps,
  FC,
  HTMLAttributes,
  PropsWithChildren,
} from "react";
import { cn } from "@/pages/_lib/utils";
import { Button, ButtonProps } from "@/pages/_components/ui/button";
import { Toggle } from "@/pages/_components/ui/toggle";

const ChatActionIconButton = ({ ...props }: ButtonProps) => {
  return (
    <Button
      size="icon"
      variant={"outline"}
      className="rounded-full h-9 w-9"
      {...props}
    />
  );
};

const ChatActionToggle = ({ ...props }: ComponentProps<typeof Toggle>) => {
  return (
    <Toggle
      {...props}
      variant="outline"
      size="sm"
      className="rounded-full focus-visible:ring-primary data-[state=on]:bg-primary/20 data-[state=on]:text-primary"
    />
  );
};

const ChatActions: FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {props.children}
    </div>
  );
};

export { ChatActions, ChatActionIconButton, ChatActionToggle };
