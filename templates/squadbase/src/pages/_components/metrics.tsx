"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, PropsWithChildren, ReactNode, useMemo } from "react";
import { MorphLoadDataProps } from "@/pages/_lib/data-props";
import { useAlias } from "@/pages/_hooks/use-alias";
import { useJsonData } from "@/pages/_hooks/use-json-data";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";
import { Card } from "@/pages/_components/ui/card";
import { Callout } from "@/pages/_components/ui/callout";

type LabelFunc = (item: any) => ReactNode;

type MetricsProps = {
  value: string | LabelFunc;
  label?: string | LabelFunc;
  prefix?: string | LabelFunc;
  suffix?: string | LabelFunc;
  footer?: string | LabelFunc;
};

const Metrics: FC<MorphLoadDataProps & MetricsProps> = (props) => {
  const {
    alias,
    loadData,
    loadDataUrl = (loadData: string) =>
      `${window.location.protocol}//${window.location.host}/cli/run/${loadData}/json`,
    // postData,
    variables = {},
    value,
    label,
    prefix,
    suffix,
    footer,
  } = props;

  const _loadData = useAlias({ loadData, alias });

  const { items, error, isLoading } = useJsonData({
    loadData: _loadData,
    variables,
    loadDataUrl,
  });

  const valueStr = useMemo(() => {
    if (!items || items.length === 0) {
      return undefined;
    }
    const item = items[0];

    if (typeof value === "function") {
      return String(value(item));
    }

    return String(item[value]);
  }, [items, value]);

  const labelStr = useMemo(() => {
    if (!items || items.length === 0 || !label) {
      return undefined;
    }
    const item = items[0];

    if (typeof label === "function") {
      return String(label(item));
    }

    return String(item[label]);
  }, [label, items]);

  const prefixStr = useMemo(() => {
    if (!items || items.length === 0 || !prefix) {
      return undefined;
    }
    const item = items[0];

    if (typeof prefix === "function") {
      return String(prefix(item));
    }

    return String(item[prefix]);
  }, [items, prefix]);

  const suffixStr = useMemo(() => {
    if (!items || items.length === 0 || !suffix) {
      return undefined;
    }
    const item = items[0];

    if (typeof suffix === "function") {
      return String(suffix(item));
    }

    return String(item[suffix]);
  }, [items, suffix]);

  const footerStr = useMemo(() => {
    if (!items || items.length === 0 || !footer) {
      return undefined;
    }
    const item = items[0];

    if (typeof footer === "function") {
      return String(footer(item));
    }

    return String(item[footer]);
  }, [items, footer]);

  return (
    <>
      <Card className="relative">
        {error ? (
          <>
            <MetricsError error={error} />
          </>
        ) : (
          <>
            <MetricsComponent
              value={valueStr}
              label={labelStr}
              prefix={prefixStr}
              suffix={suffixStr}
              footer={footerStr}
            >
              {isLoading && (
                <LoadingSpinner className="h-4 w-4 text-gray-500" />
              )}
            </MetricsComponent>
          </>
        )}
      </Card>
    </>
  );
};

const MetricsComponent: FC<
  PropsWithChildren<{
    label?: ReactNode;
    value?: ReactNode;
    prefix?: ReactNode;
    suffix?: ReactNode;
    footer?: ReactNode;
  }>
> = (props) => {
  const { label, value, prefix, suffix, footer, children } = props;
  return (
    <div className="flex flex-col gap-1 items-center w-full">
      <div>{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="mb-0.5">{prefix}</div>
        <div className="text-4xl font-semibold">{value}</div>
        <div className="mb-0.5">{suffix}</div>
      </div>
      <div>{footer}</div>
      {children}
    </div>
  );
};

export const MetricsError = (props: { error: Error }) => {
  const { error } = props;
  return (
    <MetricsComponent label={"metrics"}>
      <Callout title="An error occured with Metrics comopnent." variant="error">
        <div className="mt-3">Error Message: {error.message}</div>
      </Callout>
    </MetricsComponent>
  );
};

export { Metrics, MetricsComponent, type MetricsProps };
