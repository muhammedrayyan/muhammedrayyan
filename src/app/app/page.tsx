import Link from "next/link";
import { AlertTriangle, FileText, Plus, ScrollText, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  cn,
  ESTIMATE_STATUS_STYLES,
  formatCurrency,
  formatDueDate,
  PRIORITY_STYLES,
} from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { EstimateWithRelations } from "@/lib/types";

type RecentTask = {
  id: string;
  title: string;
  priority: string;
  due_date: string | null;
  project: { id: string; name: string; color: string } | null;
  status: { name: string; color: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [
    { count: contactCount },
    { count: taskCount },
    { count: overdueCount },
    { count: openEstimateCount },
    { count: sentProposalCount },
    { data: recentTasks },
    { data: recentEstimates },
  ] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("tasks").select("id", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", todayStr),
    supabase
      .from("estimates")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "sent"]),
    supabase
      .from("proposals")
      .select("id", { count: "exact", head: true })
      .eq("status", "sent"),
    supabase
      .from("tasks")
      .select("id, title, priority, due_date, project:projects(id, name, color), status:task_statuses(name, color)")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("estimates")
      .select("*, contact:contacts(id, name, company), property:properties(id, label)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {firstName}</h1>
          <p className="mt-1 text-sm text-muted">Here&apos;s what&apos;s happening across your workspace.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/contacts">
            <Button variant="secondary" size="sm">
              <Users size={14} /> Add customer
            </Button>
          </Link>
          <Link href="/app/estimates/new">
            <Button size="sm">
              <Plus size={14} /> New estimate
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Customers" value={contactCount ?? 0} color="#7B68EE" />
        <StatCard icon={FileText} label="Open estimates" value={openEstimateCount ?? 0} color="#5B8DEF" />
        <StatCard icon={ScrollText} label="Proposals awaiting reply" value={sentProposalCount ?? 0} color="#2FB7B0" />
        <StatCard icon={AlertTriangle} label="Overdue tasks" value={overdueCount ?? 0} color="#E5573F" />
      </div>

      <div className="mb-8 rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent estimates</h2>
          <Link href="/app/estimates" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </div>
        {!recentEstimates || recentEstimates.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No estimates yet — create one for a customer to get started.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {(recentEstimates as unknown as EstimateWithRelations[]).map((estimate) => {
              const style = ESTIMATE_STATUS_STYLES[estimate.status];
              return (
                <Link
                  key={estimate.id}
                  href={`/app/estimates/${estimate.id}`}
                  className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-[#faf9fd]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-foreground">{estimate.number}</span>
                    <span className="text-muted">· {estimate.contact?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">{formatCurrency(estimate.total)}</span>
                    <Badge className={style.badge}>{style.label}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent tasks</h2>
          <span className="text-xs text-muted">{taskCount ?? 0} total</span>
        </div>
        {!recentTasks || recentTasks.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">
            No tasks yet — create a project to start tracking work.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {(recentTasks as unknown as RecentTask[]).map((task) => {
              const due = formatDueDate(task.due_date);
              const priority = PRIORITY_STYLES[task.priority];
              return (
                <Link
                  key={task.id}
                  href={task.project ? `/app/projects/${task.project.id}` : "#"}
                  className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-[#faf9fd]"
                >
                  <div className="flex items-center gap-3">
                    <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                    <span className="font-medium text-foreground">{task.title}</span>
                    {task.project && (
                      <span className="text-muted">· {task.project.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {due && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs",
                          due.isOverdue ? "bg-rose-100 text-rose-600" : "bg-[#efedf8] text-muted",
                        )}
                      >
                        {due.formatted}
                      </span>
                    )}
                    {task.status && <Badge color={task.status.color}>{task.status.name}</Badge>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
