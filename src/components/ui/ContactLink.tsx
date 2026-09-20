import { Mail, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

type ContactLinkProps = {
  type: "phone" | "email";
  value?: string | null;
  className?: string;
};

export function ContactLink({ type, value, className }: ContactLinkProps) {
  if (!value) return <span className="text-muted-foreground">—</span>;

  const href = type === "phone" ? `tel:${value.replace(/[^\d+]/g, "")}` : `mailto:${value}`;
  const Icon = type === "phone" ? Phone : Mail;

  return (
    <a
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 text-primary underline-offset-4 transition-colors hover:underline",
        className,
      )}
      href={href}
    >
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="min-w-0 [overflow-wrap:anywhere]">{value}</span>
    </a>
  );
}
