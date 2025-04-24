import { convertStatesToValuesInVariables } from "@morph-data/frontend/api";
import { createFetcherStore } from "@/pages/_lib/store-factory";
import { useStore } from "@nanostores/react";
import { useMemo } from "react";
import { z } from "zod";

const zHtmlResponse = z.object({
  type: z.literal("html"),
  data: z.string(),
});

export const useHtmlData = (props: {
  loadData: string;
  variables: Record<string, unknown>;
  loadDataUrl: (loadData: string) => string;
}) => {
  const { loadData, variables, loadDataUrl } = props;

  const convertedVariables = convertStatesToValuesInVariables(variables);

  const $fetcherStore = useMemo(() => {
    return createFetcherStore(
      [loadData, "html", JSON.stringify(convertedVariables)],
      {
        fetcher: async () => {
          const rawResponse = await fetch(`${loadDataUrl(loadData)}`, {
            method: "POST",
            body: JSON.stringify({
              variables: convertedVariables,
            }),
            headers: {
              "content-type": "application/json",
            },
          });

          const response = await rawResponse.json();

          const parseJson = zHtmlResponse.safeParse(response);

          if (!parseJson.success) {
            throw new Error("Invalid response");
          }

          return parseJson.data;
        },
        cacheLifetime: 1000 * 60 * 5,
      }
    );
  }, [loadData, JSON.stringify(convertedVariables)]);

  const { data, error, loading } = useStore($fetcherStore);

  return {
    data,
    error,
    isLoading: loading,
  };
};
