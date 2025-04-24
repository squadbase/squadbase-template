"use client";

import React, { FC, KeyboardEvent, PropsWithChildren, useRef } from "react";
import { LucideArrowUp, LucidePlus } from "lucide-react";
import { AutosizeTextarea } from "@/pages/_components/ui/autosize-textarea";
import {
  ChatActionIconButton,
  ChatActions,
} from "@/pages/_components/ui/chat-actions";
import { Button } from "@/pages/_components/ui/button";
import { Card } from "@/pages/_components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/pages/_components/ui/dropdown-menu";

export interface ChatFormProps {
  inputValue?: string;
  onInputChange?: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  actions?: React.ReactNode;
  placeholder?: string;
  submitButtonLabel?: string;
}

const ChatForm: FC<PropsWithChildren<ChatFormProps>> = (props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.metaKey && e.key === "Enter") {
        console.log(submitButtonRef.current);
        submitButtonRef.current?.click();
      }
    },
    []
  );

  return (
    <Card className="p-2 rounded-3xl shadow">
      <form onSubmit={props.onSubmit} className="grid grid-cols-1 gap-2">
        {props.children}
        <AutosizeTextarea
          value={props.inputValue}
          placeholder={props.placeholder || "Type a message..."}
          className="resize-none"
          variant={"ghost"}
          onChange={props.onInputChange}
          maxHeight={260}
          onKeyDown={handleKeyDown}
        />
        <ChatActions>
          {props.onFileChange && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <ChatActionIconButton>
                    <LucidePlus />
                  </ChatActionIconButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload from computer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                ref={fileInputRef}
                onChange={props.onFileChange}
                type="file"
                className="hidden"
              />
            </>
          )}
          {props.actions}
          <div className="flex-1" />
          <Button
            ref={submitButtonRef}
            type="submit"
            size={props.submitButtonLabel ? "default" : "icon"}
            className="rounded-full"
          >
            {props.submitButtonLabel || <LucideArrowUp />}
          </Button>
        </ChatActions>
      </form>
    </Card>
  );
};

export { ChatForm };
