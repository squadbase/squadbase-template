import { useEffect, useReducer } from "react";

export const useRefresh = () => {
  const [, update] = useReducer((s) => s + 1, 0);

  useEffect(() => {
    const doRefresh = (event: MessageEvent) => {
      if (event.data === "morph-refresh") {
        update();
      }
    };

    window.addEventListener("message", doRefresh);

    return () => {
      window.removeEventListener("message", doRefresh);
    };
  }, []);
};
