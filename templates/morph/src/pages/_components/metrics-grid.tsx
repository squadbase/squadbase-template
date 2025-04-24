"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC, useMemo } from "react";
import { MorphLoadDataProps } from "@/pages/_lib/data-props";
import { useAlias } from "@/pages/_hooks/use-alias";
import { useJsonData } from "@/pages/_hooks/use-json-data";
import { Grid, GridProps } from "@/pages/_components/grid";
import {
  MetricsComponent,
  MetricsProps,
} from "@/pages/_components/metrics";
import { LoadingSpinner } from "@/pages/_components/ui/spinner";
import { Card } from "@/pages/_components/ui/card";
import { Callout } from "@/pages/_components/ui/callout";

type MetricsGridProps = MetricsProps & Omit<GridProps, "children">;

const MetricsGrid: FC<MorphLoadDataProps & MetricsGridProps> = (props) => {
  const {
    alias,
    loadData,
    loadDataUrl = (loadData: string) =>
      `${window.location.protocol}//${window.location.host}/cli/run/${loadData}/json`,
    variables = {},
    cols,
    className,

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

  return (
    <>
      <Grid cols={cols} className={`${className} relative`}>
        {error ? (
          <>
            <MetricsGridError error={error} cols={cols} />
          </>
        ) : (
          <>
            {items.map((item: any, index: number) => (
              <MetricsWrapper
                key={index}
                item={item}
                label={label}
                value={value}
                prefix={prefix}
                suffix={suffix}
                footer={footer}
              />
            ))}
          </>
        )}
      </Grid>
      {isLoading && (
        <LoadingSpinner className="h-4 w-4 text-gray-500 absolute top-2 left-2" />
      )}
    </>
  );
};

const MetricsWrapper: FC<MetricsProps & { item: any }> = ({
  item,
  value,
  label,
  prefix,
  suffix,
  footer,
}) => {
  const valueStr = useMemo(() => {
    if (typeof value === "function") {
      return value(item);
    }

    return item[value];
  }, [item, value]);

  const labelStr = useMemo(() => {
    if (!label) {
      return undefined;
    }

    if (typeof label === "function") {
      return label(item);
    }

    return item[label];
  }, [label, item]);

  const prefixStr = useMemo(() => {
    if (!prefix) {
      return undefined;
    }

    if (typeof prefix === "function") {
      return prefix(item);
    }

    return item[prefix];
  }, [item, prefix]);

  const suffixStr = useMemo(() => {
    if (!suffix) {
      return undefined;
    }

    if (typeof suffix === "function") {
      return suffix(item);
    }

    return item[suffix];
  }, [item, suffix]);

  const footerStr = useMemo(() => {
    if (!footer) {
      return undefined;
    }

    if (typeof footer === "function") {
      return footer(item);
    }

    return item[footer];
  }, [item, footer]);

  return (
    <Card>
      <MetricsComponent
        value={valueStr}
        label={labelStr}
        prefix={prefixStr}
        suffix={suffixStr}
        footer={footerStr}
      />
    </Card>
  );
};

const MetricsGridError = (props: { error: Error; cols?: string }) => {
  const cols = parseInt(props.cols || "3") || 3;
  const { error } = props;
  return (
    <>
      {[...new Array(cols * 2)].map((col: unknown, index: number) => (
        <Card key={index}>
          <MetricsComponent
            label={<span className="opacity-50">metrics</span>}
            value={<span className="opacity-50">123.0</span>}
          ></MetricsComponent>
        </Card>
      ))}

      <div className="absolute top-12 left-0 right-0 flex justify-center items-center">
        <Callout
          title="An error occured with MetricsGrid comopnent."
          variant="error"
          className="shadow-lg"
        >
          <div className="mt-3">Error Message: {error.message}</div>
        </Callout>
      </div>
    </>
  );
};

export { MetricsGrid };
