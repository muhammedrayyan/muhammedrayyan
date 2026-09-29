import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export const PRIORITY_STYLES: Record<
  string,
  { label: string; dot: string; badge: string }
> = {
  low: {
    label: "Low",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-600",
  },
  normal: {
    label: "Normal",
    dot: "bg-sky-500",
    badge: "bg-sky-100 text-sky-700",
  },
  high: {
    label: "High",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  urgent: {
    label: "Urgent",
    dot: "bg-rose-500",
    badge: "bg-rose-100 text-rose-700",
  },
};

export const DEFAULT_STATUS_PALETTE = [
  { name: "Backlog", color: "#94A3B8" },
  { name: "To Do", color: "#5B8DEF" },
  { name: "In Progress", color: "#F2994A" },
  { name: "Review", color: "#A67BF2" },
  { name: "Done", color: "#2FB7B0" },
];

export const PROJECT_COLORS = [
  "#7B68EE",
  "#F76B8A",
  "#2FB7B0",
  "#F2994A",
  "#5B8DEF",
  "#A67BF2",
  "#E5573F",
  "#2EB67D",
];

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  municipal: "Municipal",
  hoa: "HOA / Community",
};

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  plowing: "Plowing",
  salting: "Salting",
  shoveling: "Shoveling",
  hauling: "Hauling",
  seasonal: "Seasonal contract",
  other: "Other",
};

export const SERVICE_UNITS = [
  "per visit",
  "per push",
  "per hour",
  "per application",
  "per truckload",
  "per 1,000 sq ft",
  "flat",
];

export const ESTIMATE_STATUS_STYLES: Record<
  string,
  { label: string; badge: string }
> = {
  draft: { label: "Draft", badge: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", badge: "bg-sky-100 text-sky-700" },
  approved: { label: "Approved", badge: "bg-emerald-100 text-emerald-700" },
  declined: { label: "Declined", badge: "bg-rose-100 text-rose-700" },
  expired: { label: "Expired", badge: "bg-amber-100 text-amber-700" },
};

export const PROPOSAL_STATUS_STYLES: Record<
  string,
  { label: string; badge: string }
> = {
  draft: { label: "Draft", badge: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", badge: "bg-sky-100 text-sky-700" },
  accepted: { label: "Accepted", badge: "bg-emerald-100 text-emerald-700" },
  declined: { label: "Declined", badge: "bg-rose-100 text-rose-700" },
  expired: { label: "Expired", badge: "bg-amber-100 text-amber-700" },
};

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function computeTotals(
  lineItems: { quantity: number; unit_price: number }[],
  taxRate: number,
) {
  const subtotal = lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const taxAmount = subtotal * (taxRate / 100);
  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    total: round2(subtotal + taxAmount),
  };
}

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function formatDueDate(dateString: string | null) {
  if (!dateString) return null;
  const date = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86_400_000);

  const formatted = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return { formatted, diffDays, isOverdue: diffDays < 0 };
}
