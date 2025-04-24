import { z } from "zod";
import * as React from "react";
import { experimental_useObject, Message, UseChatHelpers } from "@ai-sdk/react";
import { convertStatesToValuesInVariables } from "@morph-data/frontend/api";

/**
 * Use object
 */
type UseObjectOptions = {
  variables?: Record<string, any>;
  postData: string;
  postDataUrl: (postData: string) => string;
  layout: "single" | "chat" | "side-by-side";
};

const morphStreamResponseSchema = z.object({
  chunks: z.array(
    z.object({
      text: z.string().nullish(),
      content: z.string().nullish(),
    })
  ),
});

export const useObject = (options: UseObjectOptions) => {
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
