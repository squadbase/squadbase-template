import { convertStatesToValuesInVariables } from "@morph-data/frontend/api";
import { createFetcherStore } from "@/pages/_lib/store-factory";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import { useCallback, useMemo, useRef } from "react";
import { z } from "zod";

export const zJsonResponse = z.object({
  type: z.literal("json"),
  data: z.object({
    items: z.array(z.any()),
    count: z.number().optional(),
  }),
});

export const useJsonData = (props: {
  loadData: string;
  variables: Record<string, unknown>;
  loadDataUrl: (loadData: string) => string | string;
}) => {
  const { loadData, variables, loadDataUrl } = props;

  // stores
  const $page = useRef(atom(0));
  const page = useStore($page.current);

  const $items = useRef(atom<Record<string, unknown>[]>([]));
  const items = useStore($items.current);

  const $isLoading = useRef(atom<boolean>(false));
  const isLoading = useStore($isLoading.current);

  const $count = useRef(atom<number | undefined>());
  const count = useStore($count.current);

  const convertedVariables = convertStatesToValuesInVariables(variables);

  const $fetcherStore = useMemo(() => {
    return createFetcherStore(
      [loadData, "json", JSON.stringify(convertedVariables), page],
      {
        fetcher: async () => {
          const searchParams = new URLSearchParams();
          searchParams.append("skip", (page * 100).toString());
          searchParams.append("limit", "100");

          const url =
            typeof loadDataUrl === "function"
              ? loadDataUrl(loadData)
              : loadDataUrl;

          const rawResponse = await fetch(`${url}?${searchParams.toString()}`, {
            method: "POST",
            body: JSON.stringify({
              variables: convertedVariables,
            }),
            headers: {
              "content-type": "application/json",
            },
          });

          const response = await rawResponse.json();

          const parseJson = zJsonResponse.safeParse(response);

          if (!parseJson.success) {
            throw new Error("Invalid response");
          }

          if (parseJson.data.data.items) {
            if (page === 0) {
              $items.current.set(parseJson.data.data.items);
            } else {
              $items.current.set([...items, ...parseJson.data.data.items]);
            }
          }

          if (parseJson.data.data.count) {
            $count.current.set(parseJson.data.data.count);
          }

          $isLoading.current.set(false);

          return parseJson.data;
        },
        cacheLifetime: 1000 * 60 * 5,
      }
    );
  }, [loadData, JSON.stringify(convertedVariables), page, items]);

  const hasNext = useMemo(() => {
    if (!count) return false;
    return items.length < count;
  }, [count, items]);

  const goNextPage = useCallback(() => {
    $isLoading.current.set(true);
    $page.current.set(page + 1);
  }, [page]);

  const { data, error } = useStore($fetcherStore);

  const _items = useMemo(() => {
    if (items.length > 0) {
      return items;
    }
    if (data) {
      return data.data.items as Record<string, unknown>[];
    }

    return [];
  }, [data, items]);

  return {
    data,
    items: _items,
    count,
    isLoading,
    error,
    goNextPage,
    hasNext,
  };
};
