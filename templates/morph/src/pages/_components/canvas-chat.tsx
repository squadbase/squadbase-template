"use client";

import React, { FC, PropsWithChildren, useMemo } from "react";
// dependencies
import { Message } from "@ai-sdk/react";
import { LucideDownload, LucidePlus } from "lucide-react";
// shadcn/ui
import { Button } from "@/pages/_components/ui/button";
import { Card } from "@/pages/_components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/pages/_components/ui/dropdown-menu";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/pages/_components/ui/resizable";
// agents-kit
import { ChatBubble } from "@/pages/_components/ui/chat-bubble";
import { MdRenderer } from "@/pages/_components/ui/md-renderer";
import { ChatForm } from "@/pages/_components/ui/chat-form";
// registry
import { MorphPostDataProps } from "@/pages/_lib/data-props";
import { Callout } from "@/pages/_components/ui/callout";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";
import { useLLMUtils } from "@/pages/_hooks/use-llm-utils";
import { useObject } from "@/pages/_hooks/use-object";
import { MessageArea } from "@/pages/_components/ui/message-area";

/**
 * Side-by-side
 */
const SideBySide: FC<
  PropsWithChildren<{ content?: string; active?: boolean }>
> = (props) => {
  const { children, content, active } = props;

  const contentType = useMemo(() => {
    if (!content) return;
    if (/^\s*(<!DOCTYPE html>)?\s*<html[\s>]/i.test(content)) {
      return "HTML_TOP";
    } else if (/^\s*<([a-zA-Z]+)[\s>]/.test(content)) {
      return "HTML_OTHER";
    } else if (/^\s*#\s|^\s*[*_-]{1,3}\s|^\s*\d+\.\s|^\s*>/.test(content)) {
      return "MARKDOWN";
    } else {
      // その他
      return "UNKNOWN";
    }
  }, [content]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel className="p-4">{children}</ResizablePanel>
        <ResizableHandle withHandle className="bg-transparent" />
        <ResizablePanel className="p-2">
          <Card className="h-full w-full shadow">
            <div className="relative h-full w-full">
              {contentType === "HTML_TOP" || contentType === "HTML_OTHER" ? (
                <HtmlRenderer
                  source={content || ""}
                  contentType={contentType}
                />
              ) : contentType === "MARKDOWN" ? (
                <div className="p-4">
                  <MdRenderer value={content || ""} />
                </div>
              ) : (
                <div className="p-4">{content}</div>
              )}
              {/* {loading && <LoadingSpinner className="h-4 w-4 text-gray-500 absolute top-2 left-2" />} */}
            </div>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
};

/**
 * HTML Renderer
 */
type HtmlRendererProps = {
  source: string;
  contentType: "HTML_TOP" | "HTML_OTHER";
};

export const HtmlRenderer: React.FC<HtmlRendererProps> = (props) => {
  const { source, contentType } = props;

  const { downloadHtml } = useLLMUtils({});

  const htmlString = useMemo(() => {
    if (contentType === "HTML_TOP") {
      const blob = new Blob([source], { type: "text/html" });

      return URL.createObjectURL(blob);
    }

    if (contentType === "HTML_OTHER") {
      const blob = new Blob(
        [
          `<html>
            <head></head>
            <body>${source}</body>
          </html>`,
        ],
        { type: "text/html" }
      );

      return URL.createObjectURL(blob);
    }

    return undefined;
  }, [source, contentType]);

  return (
    <div className="h-full w-full">
      <div className="flex items-center gap-3 mb-1 w-full">
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost">
              <LucideDownload size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => downloadHtml(props.source)}>
              HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <iframe
        title="MorphEmbed"
        key={htmlString}
        width={"100%"}
        height={"100%"}
        src={htmlString}
      />
    </div>
  );
};

/**
 * Messages
 */
type MessagesProps = {
  messages: Message[];
  commingMessage?: Message;
  isLoading?: boolean;
  onStartNewThread?: () => void;
};

const Messages: React.FC<MessagesProps> = (props) => {
  const {
    messages,
    isLoading = false,
    onStartNewThread,
    commingMessage,
  } = props;

  return (
    <MessageArea
      className={`flex-1 w-full pb-8 flex-col [&>div>div[style]]:!block`}
      messages={messages}
      status={isLoading ? "streaming" : "finished"}
    >
      <>
        {messages.map((message) => (
          <div key={message.id} className="my-5 w-full">
            <div className="w-full">
              <React.Suspense fallback={<div>{message.content}</div>}>
                <ChatBubble
                  variant={message.role === "user" ? "bubble" : "ghost"}
                  className={`${message.role === "user" ? "ml-auto" : ""}`}
                >
                  <MdRenderer value={message.content} />
                </ChatBubble>
              </React.Suspense>
            </div>
          </div>
        ))}
        {isLoading && commingMessage && (
          <div key={commingMessage.id} className="my-5 w-full">
            <div className="w-full">
              <React.Suspense fallback={<div>{commingMessage.content}</div>}>
                <ChatBubble
                  variant={commingMessage.role === "user" ? "bubble" : "ghost"}
                >
                  <MdRenderer value={commingMessage.content} />
                </ChatBubble>
              </React.Suspense>
            </div>
            <hr className="mt-5" />
          </div>
        )}
        {messages.length > 0 && (
          <div className="flex">
            <div className="flex-1" />
            <Button variant="ghost" onClick={onStartNewThread}>
              <LucidePlus size={16} className="mr-3" />
              Start New Thread
            </Button>
            <div className="flex-1" />
          </div>
        )}
        {isLoading && (
          <div className="w-full flex justify-center">
            <LoadingSpinner className="h-4 w-4 my-2" />
          </div>
        )}
      </>
    </MessageArea>
  );
};

/**
 * LLM Components
 */
export type CanvasChatProps = {
  submitLabel?: string;
  height?: number;
};

const CanvasChat = React.memo((props: CanvasChatProps & MorphPostDataProps) => {
  const {
    postData,
    postDataUrl = (loadData: string) => `/cli/run-stream/${loadData}`,
    variables = {},
    height = 500,
    submitLabel,
  } = props;

  const {
    handleInputChange,
    handleSubmit,
    startNewThread,
    messages,
    content,
    isLoading,
    error,
    input,
    commingMessage,
  } = useObject({
    variables,
    postDataUrl,
    postData,
    layout: "side-by-side",
  });

  return (
    <SideBySide active={content.length > 0} content={content}>
      <div className={`flex h-full flex-col w-full`} style={{ height }}>
        {error && (
          <Callout title="Error" variant="error" className="my-4">
            {error.message}
          </Callout>
        )}
        <Messages
          messages={messages}
          commingMessage={commingMessage}
          isLoading={isLoading}
          onStartNewThread={startNewThread}
        />
        <ChatForm
          placeholder={"Type your message here"}
          inputValue={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          submitButtonLabel={submitLabel}
        />
      </div>
    </SideBySide>
  );
});
CanvasChat.displayName = "CanvasChat";

export { CanvasChat };
