import { State } from "@morph-data/frontend/api";
import { ComponentProps, FC } from "react";
import { DateRangePicker as DateRangePickerPrimitive } from "@/pages/_components/ui/date-picker-primitive";

type DateRangePickerPrimitiveProps = ComponentProps<
  typeof DateRangePickerPrimitive
>;

type DateRangePickerProps = {
  state: [State<Date | undefined>, State<Date | undefined>];
} & Omit<DateRangePickerPrimitiveProps, "value" | "defaultValue" | "onChange">;

const DateRangePicker: FC<DateRangePickerProps> = (props) => {
  const { state, ...rest } = props;

  return (
    <DateRangePickerPrimitive
      {...rest}
      value={{
        from: state[0].value,
        to: state[1].value,
      }}
      onChange={(value) => {
        state[0].update(value?.from);
        state[1].update(value?.to);
      }}
    ></DateRangePickerPrimitive>
  );
};

export { DateRangePicker };
