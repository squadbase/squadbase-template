"use client";

import React from "react";
// dependencies
import { Message } from "@ai-sdk/react";
import { LucidePlus } from "lucide-react";
// shadcn/ui
import { Button } from "@/pages/_components/ui/button";
// agents-kit
import { ChatBubble } from "@/pages/_components/ui/chat-bubble";
import { MdRenderer } from "@/pages/_components/ui/md-renderer";
import { ChatForm } from "@/pages/_components/ui/chat-form";
// registry
import { MorphPostDataProps } from "@/pages/_lib/data-props";
import { Callout } from "@/pages/_components/ui/callout";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";
import { MessageArea } from "@/pages/_components/ui/message-area";
import { useObject } from "@/pages/_hooks/use-object";

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
      className={`flex-1 w-full pb-8 [&>div>div[style]]:!block`}
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
export type ChatProps = {
  submitLabel?: string;
  height?: number;
};

const Chat = React.memo((props: ChatProps & MorphPostDataProps) => {
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
    isLoading,
    error,
    input,
    commingMessage,
  } = useObject({
    variables,
    postDataUrl,
    postData,
    layout: "chat",
  });

  return (
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
  );
});
Chat.displayName = "Chat";

export { Chat };
