import { State } from "@morph-data/frontend/api";
import { ComponentProps, FC } from "react";
import { DatePicker as DatePickerPrimitive } from "@/pages/_components/ui/date-picker-primitive";

type DatePickerPrimitiveProps = ComponentProps<typeof DatePickerPrimitive>;

type DatePickerProps = {
  state: State<Date | undefined>;
} & Omit<DatePickerPrimitiveProps, "value" | "defaultValue" | "onChange">;

const DatePicker: FC<DatePickerProps> = (props) => {
  const { state, ...rest } = props;

  return (
    <DatePickerPrimitive
      {...rest}
      value={state.value}
      onChange={(value) => state.update(value)}
    ></DatePickerPrimitive>
  );
};

export { DatePicker };
