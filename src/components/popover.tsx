"use client";
import { Popover as PopoverPrimitive } from "radix-ui";
import { forwardRef } from "react";
import { tw } from "../lib/tw";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      side="bottom"
      {...props}
      className={tw(
        "bg-(--ln-gray-05) text-(--ln1771-gray-80) border-(--ln-gray-50) data-[state=closed]:animate-popover-out data-[state=open]:animate-popover-in origin-(--radix-popover-content-transform-origin) z-50 min-w-[240px] max-w-[98vw] rounded-xl border px-2 py-2 text-sm shadow-lg backdrop-blur-lg focus-visible:outline-none",
        props.className,
      )}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

const PopoverClose = PopoverPrimitive.PopoverClose;

export { Popover, PopoverTrigger, PopoverContent, PopoverClose };
