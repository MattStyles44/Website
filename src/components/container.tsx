import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16",
        className,
      )}
    >
      {children}
    </main>
  );
}
