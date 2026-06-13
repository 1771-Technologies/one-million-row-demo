import type { JSX } from "react";
import { tw } from "../../lib/tw";

export function GridInput(props: JSX.IntrinsicElements["input"]) {
  return (
    <input
      {...props}
      className={tw(
        "min-w-full md:min-w-[160px] flex items-center justify-between shadow-[0_1.5px_2px_0px_var(--ln-gray-30),0_0_0_1px_var(--ln-gray-30)] rounded-lg px-2 h-[28px] text-sm data-[placeholder]:text-(--ln-gray-70)",
        "bg-(--ln-gray-00) gap-2 text-(--ln-gray-90)",
        "focus-visible:shadow-[0_1.5px_2px_0px_var(--ln-primary-50),0_0_0_1px_var(--ln-primary-50)] focus-visible:outline-none",
        "data-[disabled]:shadow-[0_1.5px_2px_0px_var(--ln-gray-20),0_0_0_1px_var(--ln-gray-20)] data-[placeholder]:data-[disabled]:text-(--ln-gray-50)",
        "disabled:shadow-[0_1.5px_2px_0px_var(--ln-gray-20),0_0_0_1px_var(--ln-gray-20)] disabled:text-(--ln-gray-50)",
        props.className,
      )}
    />
  );
}
