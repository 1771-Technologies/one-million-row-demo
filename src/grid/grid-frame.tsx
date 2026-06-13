import { type PropsWithChildren, type ReactNode } from "react";
import { tw } from "../lib/tw";

export function GridFrame(
  props: PropsWithChildren<{
    title: string;
    headerChildren: ReactNode;
    onReset: () => void;
  }>,
) {
  return (
    <div className={tw("lng-grid h-full w-full bg-{--ln-gray-00)")}>
      <div className="flex flex-col h-full w-full">
        <div>
          <div className="flex items-center gap-2 py-4 px-4">
            <h2 className="flex-1 text-[var(--ln-gray-80)] font-[500]">
              {props.title}
            </h2>
            <div className="flex-1" />
            <button
              onClick={() => props.onReset()}
              className="flex items-center px-4 h-[44px] gap-2 border-(--ln-gray-30) border rounded-lg bg-white dark:bg-(--ln-gray-05) text-black dark:text-(--ln-gray-80) font-semibold"
            >
              <RefreshIcon /> Reset
            </button>
          </div>
          <div className="relative h-px bg-{--ln-gray-10) flex items-center justify-center"></div>
          {props.headerChildren}
        </div>
        <div className="flex-1 relative">
          <div className="absolute w-full h-full border-t border-t-(--ln-gray-10)">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.0503 11.2988L16.9937 9.24217L14.937 11.2988"
        stroke="#161616"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.860319 9.40039L2.91698 11.457L4.97363 9.40039"
        stroke="#161616"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.0695 9.51361C17.0804 9.67449 17.0859 9.83684 17.0859 10.0005C17.0859 13.9131 13.9141 17.085 10.0015 17.085C7.98749 17.085 6.16979 16.2446 4.87992 14.8954M2.98567 10.9909C2.9404 10.6672 2.91699 10.3366 2.91699 10.0005C2.91699 6.08784 6.08882 2.91602 10.0015 2.91602C12.1997 2.91602 14.164 3.91717 15.4635 5.48837"
        stroke="#161616"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
