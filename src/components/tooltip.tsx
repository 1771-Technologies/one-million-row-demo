import { Tooltip as T } from "radix-ui";
import type { PropsWithChildren, ReactNode } from "react";
import { tw } from "../lib/tw";

const Tooltip = (
  props: PropsWithChildren<{ trigger: ReactNode; className?: string }>,
) => {
  return (
    <T.Provider>
      <T.Root>
        <T.Trigger asChild>{props.trigger}</T.Trigger>
        <T.Portal>
          <T.Content
            className={tw(
              "p-2 text-sm select-none rounded-lg overflow-hidden border border-gray-400 bg-(--ln-gray-30)",
              props.className,
            )}
            sideOffset={5}
          >
            {props.children}
            <T.Arrow className="fill-white" />
          </T.Content>
        </T.Portal>
      </T.Root>
    </T.Provider>
  );
};

export default Tooltip;
