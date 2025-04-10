import React, { useCallback, useEffect, useRef, useState } from "react";
import { State } from "@morph-data/frontend/api";
import { MorphPostDataProps } from "@/pages/_lib/data-props";
import { Button } from "@/pages/_components/ui/button";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";

type StateFormProps<T extends Record<string, string | undefined>> = {
  state: State<T>;
  children: React.ReactNode;
  withSubmit?: boolean;
} & Partial<MorphPostDataProps> & {
    callback?: (data: any) => void;
  };

function genKey(): string {
  const strong = 1000;
  return (
    new Date().getTime().toString(16) +
    Math.floor(strong * Math.random()).toString(16)
  );
}

const StateForm = <T extends Record<string, string | undefined>>({
  state,
  children,
  postData,
  postDataUrl,
  callback,
}: StateFormProps<T>) => {
  const formElementKey = useRef(genKey());

  const [localState, setLocalState] = useState<T>(state.value as T);
  const [isLoading, setIsLoading] = useState(false);

  // sync state
  useEffect(() => {
    setLocalState(state.value as T);
  }, [state, state.value]);

  const handleChange = (name: string, value: any) => {
    const updatedState = { ...localState, [name]: value };
    setLocalState(updatedState);
    state.update(localState);
  };

  const handleClear = () => {
    state.update({} as T);
    setLocalState({} as T);

    const newKey = genKey();
    formElementKey.current = newKey;
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!postData) return;

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
          body: JSON.stringify(localState),
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
    },
    [callback, localState, postData, postDataUrl]
  );

  // 再帰的に子要素を探索し、該当する要素にプロップを付与
  const enhanceChildren = (children: React.ReactNode): React.ReactNode => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        if (child.props.name) {
          const name = child.props.name;

          // 明示的に型を付与
          return React.cloneElement(
            child as React.ReactElement<{
              value?: string;
              onChange?: (
                e: React.ChangeEvent<
                  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >
              ) => void;
            }>,
            {
              // value: localState[name] || undefined,
              onChange: (
                e: React.ChangeEvent<
                  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
                >
              ) => handleChange(name, e.target.value),
            }
          );
        }
        if (child.props.children) {
          return React.cloneElement(
            child as React.ReactElement<{ children?: React.ReactNode }>,
            {
              children: enhanceChildren(child.props.children),
            }
          );
        }
      }
      return child;
    });
  };

  return (
    <>
      <form key={formElementKey.current} onSubmit={handleSubmit}>
        {enhanceChildren(children)}
        <div className="flex items-center gap-2 mt-4">
          <Button type="submit" disabled={isLoading}>
            Submit {isLoading && <LoadingSpinner />}
          </Button>
          {Object.keys(localState).length > 0 && (
            <Button variant="secondary" onClick={handleClear}>
              Clear
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

StateForm.displayName = "Form";

export { StateForm as Form };
