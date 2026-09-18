import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div
        className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}1f`, color }}
      >
        <Icon size={18} />
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
