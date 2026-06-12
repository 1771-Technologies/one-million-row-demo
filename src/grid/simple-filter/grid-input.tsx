import type { JSX } from "react";
import { tw } from "../../lib/tw";

export function GridInput(props: JSX.IntrinsicElements["input"]) {
  return (
    <input
      {...props}
      className={tw(
        "min-w-full md:min-w-[160px] flex items-center justify-between shadow-[0_1.5px_2px_0px_var(--lng1771-gray-30),0_0_0_1px_var(--lng1771-gray-30)] rounded-lg px-2 h-[28px] text-sm data-[placeholder]:text-(--lng1771-gray-70)",
        "bg-(--lng1771-gray-00) gap-2 text-(--lng1771-gray-90)",
        "focus-visible:shadow-[0_1.5px_2px_0px_var(--lng1771-primary-50),0_0_0_1px_var(--lng1771-primary-50)] focus-visible:outline-none",
        "data-[disabled]:shadow-[0_1.5px_2px_0px_var(--lng1771-gray-20),0_0_0_1px_var(--lng1771-gray-20)] data-[placeholder]:data-[disabled]:text-(--lng1771-gray-50)",
        "disabled:shadow-[0_1.5px_2px_0px_var(--lng1771-gray-20),0_0_0_1px_var(--lng1771-gray-20)] disabled:text-(--lng1771-gray-50)",
        props.className,
      )}
    />
  );
}
