import { initials } from "@/lib/utils";

export function Avatar({
  name,
  color = "#7B68EE",
  size = 28,
}: {
  name: string | null | undefined;
  color?: string | null;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.38),
        backgroundColor: color ?? "#7B68EE",
      }}
      title={name ?? undefined}
    >
      {initials(name)}
    </span>
  );
}
