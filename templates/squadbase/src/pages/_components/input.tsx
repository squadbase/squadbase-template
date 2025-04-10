"use client";

import { Input as InputPrimitive } from "@/pages/_components/ui/input";
import { State } from "@morph-data/frontend/api";
import {
  forwardRef,
  ForwardRefExoticComponent,
  useEffect,
  useState,
} from "react";

type InputPrimitiveProps = React.ComponentProps<typeof InputPrimitive>;

type ThisInputProps = {
  state?: State<string | undefined>;
  debounce?: number;
};

type InputProps = InputPrimitiveProps & ThisInputProps;

const InputWithState = forwardRef<
  HTMLInputElement,
  InputProps & Required<ThisInputProps>
>((props, ref) => {
  const { state, debounce } = props;

  const [inputValue, setInputValue] = useState(state.value);

  useEffect(() => {
    const handler = setTimeout(() => {
      state.update(inputValue);
    }, debounce);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, debounce, state]);

  return (
    <InputPrimitive
      ref={ref}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      {...props}
    />
  );
});
InputWithState.displayName = "InputWithState";

const Input: ForwardRefExoticComponent<InputProps> = forwardRef<
  HTMLInputElement,
  InputProps
>((props, forwardedRef) => {
  const { state, debounce } = props;

  if (state) {
    return (
      <InputWithState
        ref={forwardedRef}
        {...props}
        state={state}
        debounce={debounce || 300}
      />
    );
  }

  return <InputPrimitive ref={forwardedRef} {...props} />;
});
Input.displayName = "Input";

export { Input };
