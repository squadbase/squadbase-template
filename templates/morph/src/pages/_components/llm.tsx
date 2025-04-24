"use client";

import React, { FC, PropsWithChildren, useMemo } from "react";
// dependencies
import { Message, experimental_useObject, UseChatHelpers } from "@ai-sdk/react";
import z from "zod";
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
import { ScrollArea } from "@/pages/_components/ui/scroll-area";
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
import { convertStatesToValuesInVariables } from "@morph-data/frontend/api";
import { useLLMUtils } from "@/pages/_hooks/use-llm-utils";

/**
 * Side-by-side
 */
const SideBySide: FC<
  PropsWithChildren<{ active?: boolean; content?: string }>
> = (props) => {
  const { children, active, content } = props;

  const contentType = useMemo(() => {
    console.log(content);
    if (!content) return;
    if (/^\s*(<!DOCTYPE html>)?\s*<html[\s>]/i.test(content)) {
      // トップレベルが <html> タグの時
      return "HTML_TOP";
    } else if (/^\s*<([a-zA-Z]+)[\s>]/.test(content)) {
      // HTML形式だがトップレベルが <html> ではない時
      return "HTML_OTHER";
    } else if (/^\s*#\s|^\s*[*_-]{1,3}\s|^\s*\d+\.\s|^\s*>/.test(content)) {
      // マークダウン形式の可能性がある時
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
 * Use object
 */
type UseObjectOptions = {
  variables?: Record<string, any>;
  postData: string;
  postDataUrl: (postData: string) => string;
  layout: LLMProps["layout"];
};

const morphStreamResponseSchema = z.object({
  chunks: z.array(
    z.object({
      text: z.string().nullish(),
      content: z.string().nullish(),
    })
  ),
});

const useObject = (options: UseObjectOptions) => {
  const { variables, postData, postDataUrl, layout } = options;

  const [threadId, setThreadId] = React.useState(crypto.randomUUID());
  const [isNewConversation, setIsNewConversation] = React.useState(true);

  const [_messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [latestContent, setLatestContent] = React.useState("");

  const [commingMessage, setCommingMessage] = React.useState<
    Message | undefined
  >(undefined);

  const handleInputChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setInput(event.target.value);
  };

  const { submit, object, isLoading, error } = experimental_useObject({
    api: postDataUrl(postData),
    headers: {
      "content-type": "application/json",
    },
    fetch: async () => {
      return fetch(postDataUrl(postData), {
        method: "POST",
        body: JSON.stringify({
          variables: {
            ...convertStatesToValuesInVariables(variables ?? {}),
            prompt: input,
            thread_id: threadId,
            is_new_conversation: isNewConversation,
          },
        }),
        headers: {
          "content-type": "application/json",
        },
      });
    },
    schema: morphStreamResponseSchema,
    onFinish: (response) => {
      setMessages((current) => [
        ...current,
        {
          content:
            response.object?.chunks.map((chunk) => chunk.text).join("") || "",
          role: "assistant",
          id: crypto.randomUUID(),
        },
      ]);
      setLatestContent(
        response.object?.chunks.map((chunk) => chunk.content).join("") || ""
      );
      setCommingMessage(undefined);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const startNewThread = React.useCallback(() => {
    setThreadId(crypto.randomUUID());
    setMessages([]);
    setIsNewConversation(() => true);
  }, [setMessages]);

  const handleSubmit: UseChatHelpers["handleSubmit"] = React.useCallback(
    (event?: { preventDefault?: (() => void) | undefined }) => {
      event?.preventDefault?.();

      if (layout === "single") {
        startNewThread();
      }
      setMessages([
        ..._messages,
        { content: input, role: "user", id: crypto.randomUUID() },
      ]);
      submit({ input });
      setInput("");
      setIsNewConversation(() => false);
    },
    [input, layout, _messages, startNewThread, submit]
  );

  React.useEffect(() => {
    if (commingMessage) {
      setCommingMessage((cm) => {
        return {
          ...cm,
          content: object?.chunks?.map((chunk) => chunk?.text).join("") || "",
        } as Message;
      });
    } else {
      setCommingMessage({
        content: object?.chunks?.map((chunk) => chunk?.text).join("") || "",
        role: "assistant",
        id: crypto.randomUUID(),
      } as Message);
    }
  }, [object?.chunks]);

  return {
    handleSubmit,
    handleInputChange,
    startNewThread,
    input,
    isLoading,
    content: latestContent,
    messages: _messages,
    commingMessage,
    error,
  };
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
  layout: LLMProps["layout"];
  historyOrder: LLMProps["historyOrder"];
  height: LLMProps["height"];
  isLoading?: boolean;
  onStartNewThread?: () => void;
};

const Messages: React.FC<MessagesProps> = (props) => {
  const {
    messages,
    layout,
    historyOrder,
    height,
    isLoading = false,
    onStartNewThread,
    commingMessage,
  } = props;

  const latestAiMessage = React.useMemo(() => {
    if (isLoading && commingMessage) {
      return commingMessage;
    }
    const aiMessages = messages.filter((message) => message.role !== "user");
    return aiMessages[aiMessages.length - 1];
  }, [isLoading, commingMessage, messages]);

  return (
    <ScrollArea
      className={`flex-1 w-full pb-8 ${
        historyOrder === "default" ? "flex-col" : "flex-col-reverse"
      } [&>div>div[style]]:!block`}
      style={{ height }}
    >
      {(layout === "chat" || layout === "side-by-side") && (
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
                    variant={
                      commingMessage.role === "user" ? "bubble" : "ghost"
                    }
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
      )}
      {layout === "single" && (
        <div className="my-4">
          {isLoading && (
            <div className="w-full flex justify-center">
              <LoadingSpinner className="h-4 w-4 my-2" />
            </div>
          )}
          {latestAiMessage && (
            <React.Suspense fallback={<div>{latestAiMessage.content}</div>}>
              <MdRenderer value={latestAiMessage.content} />
            </React.Suspense>
          )}
        </div>
      )}
    </ScrollArea>
  );
};

/**
 * LLM Components
 */
export type LLMProps = {
  layout?: "chat" | "single" | "side-by-side";
  layoutOrder?: "default" | "reverse";
  historyOrder?: "default" | "reverse";
  inputType?: "default" | "text" | "file" | "files" | "button";
  submitLabel?: string;
  height?: number;
};

const LLM = React.memo((props: LLMProps & MorphPostDataProps) => {
  const {
    postData,
    postDataUrl = (loadData: string) => `/cli/run-stream/${loadData}`,
    variables = {},
    height,
    layout = "chat",
    inputType = "default",
    layoutOrder = "default",
    historyOrder = "default",
    submitLabel = "Submit",
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
    layout,
  });

  return (
    <SideBySide active={layout === "side-by-side"} content={content}>
      <div
        className={`flex h-full ${
          layoutOrder === "default" ? "flex-col" : "flex-col-reverse"
        } w-full`}
        style={{ height }}
      >
        {error && (
          <Callout title="Error" variant="error" className="my-4">
            {error.message}
          </Callout>
        )}
        <Messages
          messages={messages}
          commingMessage={commingMessage}
          layout={layout}
          historyOrder={historyOrder}
          height={height}
          isLoading={isLoading}
          onStartNewThread={startNewThread}
        />
        {(inputType === "default" || inputType === "text") && (
          <ChatForm
            placeholder={"Type your message here"}
            inputValue={input}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        )}
        {inputType === "button" && (
          <div className="p-3 w-full">
            <Button
              className="w-full"
              onClick={(e) => handleSubmit(e, { allowEmptySubmit: true })}
            >
              {submitLabel}
            </Button>
          </div>
        )}
      </div>
    </SideBySide>
  );
});
LLM.displayName = "LLM";

export { LLM };
