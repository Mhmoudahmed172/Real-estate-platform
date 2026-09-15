import type { PropsWithChildren } from "react";
import { Card } from "@/components/ui/Card";

export function DataTableShell({ children }: PropsWithChildren) {
  return <Card className="overflow-hidden">{children}</Card>;
}
