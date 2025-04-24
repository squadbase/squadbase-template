import React, { FC, PropsWithChildren, useState } from "react";
import { MorphPostDataProps } from "@/pages/_lib/data-props";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";

type TriggerProps = MorphPostDataProps & {
  callback?: (data: unknown) => void;
};

const Trigger: FC<PropsWithChildren<TriggerProps>> = ({
  postData,
  postDataUrl,
  variables = {},
  callback,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    const url =
      typeof postDataUrl === "function" ? postDataUrl(postData) : postDataUrl;

    if (!url) {
      throw new Error("postData or postDataUrl is required");
    }

    try {
      setIsLoading(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(variables),
      });

      if (!response.ok) {
        throw new Error("An error occurred while executing postData");
      }

      const data = await response.json();
      callback?.(data);
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // 子要素が1つの場合、その要素にonClickハンドラを追加する
  if (!React.isValidElement(children)) {
    throw new Error(
      "Trigger component requires exactly one valid React element as a child"
    );
  }

  if (isLoading) {
    // Add loading spinner as child
    return React.cloneElement(children, {
      ...children.props,
      disabled: true,
      children: (
        <>
          {children.props.children}
          <LoadingSpinner />
        </>
      ),
    });
  }

  return React.cloneElement(children, {
    onClick: handleClick,
    ...children.props,
  });
};

export { Trigger };
