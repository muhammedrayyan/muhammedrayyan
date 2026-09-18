import type { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#efe9ff,_#f7f7fb_55%)] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
            F
          </div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {children}
        </div>
        <div className="mt-4 text-center text-sm text-muted">{footer}</div>
      </div>
    </div>
  );
}
