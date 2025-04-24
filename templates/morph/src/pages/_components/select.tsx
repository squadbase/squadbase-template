import {
  ComponentProps,
  FC,
  forwardRef,
  ForwardRefExoticComponent,
} from "react";
import * as SelectPrimitive from "@/pages/_components/ui/select";
import { State } from "@morph-data/frontend/api";
import { MorphLoadDataProps } from "@/pages/_lib/data-props";
import { useAlias } from "@/pages/_hooks/use-alias";
import { useJsonData } from "@/pages/_hooks/use-json-data";

type SelectRootProps = {
  state?: State<string | undefined>;
  className?: string;
  placeholder?: string;
  clearButton?: boolean;
};

const SelectRoot: ForwardRefExoticComponent<
  ComponentProps<typeof SelectPrimitive.Select> & SelectRootProps
> = forwardRef<
  HTMLSelectElement,
  ComponentProps<typeof SelectPrimitive.Select> & SelectRootProps
>((props) => {
  const { state } = props;

  if (state) {
    return <SelectRootWithState {...props} state={state} />;
  }

  return (
    <SelectPrimitive.Select {...props}>
      <SelectPrimitive.SelectTrigger>
        <SelectPrimitive.SelectValue />
      </SelectPrimitive.SelectTrigger>
      <SelectPrimitive.SelectContent>
        {props.children}
      </SelectPrimitive.SelectContent>
    </SelectPrimitive.Select>
  );
});

SelectRoot.displayName = "SelectRoot";

const SelectRootWithState: ForwardRefExoticComponent<
  ComponentProps<typeof SelectPrimitive.Select> &
    SelectRootProps & { state: State<string | undefined> }
> = forwardRef<
  HTMLSelectElement,
  ComponentProps<typeof SelectPrimitive.Select> &
    SelectRootProps & { state: State<string | undefined> }
>((props) => {
  const { state, children, ...rest } = props;

  return (
    <SelectPrimitive.Select
      {...rest}
      value={state.value}
      onValueChange={(value) => {
        state.update(value);
      }}
    >
      <SelectPrimitive.SelectTrigger>
        <SelectPrimitive.SelectValue />
      </SelectPrimitive.SelectTrigger>
      <SelectPrimitive.SelectContent>{children}</SelectPrimitive.SelectContent>
    </SelectPrimitive.Select>
  );
});

SelectRootWithState.displayName = "SelectRootWithState";

type SelectItemsProps = {
  items?: Record<string, unknown>[];
  valueKey?: string;
  labelKey?: string;
};

const SelectItems: FC<MorphLoadDataProps & SelectItemsProps> = (props) => {
  const {
    items,
    alias,
    loadData,
    valueKey = "value",
    labelKey = "label",
  } = props;

  if (alias || loadData) {
    return <SelectItemsWithLoadData {...props} />;
  }

  return (
    <>
      {items?.map((item, index) => (
        <SelectItem key={index} value={String(item[valueKey])}>
          {String(item[labelKey])}
        </SelectItem>
      ))}
    </>
  );
};

const SelectItemsWithLoadData: FC<MorphLoadDataProps & SelectItemsProps> = (
  props
) => {
  const {
    alias,
    loadData,
    loadDataUrl = (loadData: string) =>
      `${window.location.protocol}//${window.location.host}/cli/run/${loadData}/json`,
    variables = {},
    valueKey = "value",
    labelKey = "label",
  } = props;

  const _loadData = useAlias({ loadData, alias });

  const { items } = useJsonData({
    loadData: _loadData,
    variables,
    loadDataUrl,
  });

  return (
    <>
      {items?.map((item, index) => (
        <SelectItem key={index} value={String(item[valueKey])}>
          {String(item[labelKey])}
        </SelectItem>
      ))}
    </>
  );
};

const SelectGroup = SelectPrimitive.SelectGroup;
const SelectGroupLabel = SelectPrimitive.SelectLabel;
const SelectItem = SelectPrimitive.SelectItem;
const SelectSeparator = SelectPrimitive.SelectSeparator;

export {
  SelectRoot as Select,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectSeparator,
  SelectItems,
};
