import Link from "next/link";
import { AlertTriangle, CalendarClock, FolderKanban, Plus, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDueDate, PRIORITY_STYLES } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

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

  const today = new Date();
  const in7Days = new Date(today.getTime() + 7 * 86_400_000);
  const todayStr = today.toISOString().slice(0, 10);
  const in7DaysStr = in7Days.toISOString().slice(0, 10);

  const [
    { count: contactCount },
    { count: projectCount },
    { count: taskCount },
    { count: overdueCount },
    { count: dueSoonCount },
    { data: recentTasks },
  ] = await Promise.all([
    supabase.from("contacts").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("tasks").select("id", { count: "exact", head: true }),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", todayStr),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .gte("due_date", todayStr)
      .lte("due_date", in7DaysStr),
    supabase
      .from("tasks")
      .select("id, title, priority, due_date, project:projects(id, name, color), status:task_statuses(name, color)")
      .order("created_at", { ascending: false })
      .limit(8),
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
              <Users size={14} /> Add contact
            </Button>
          </Link>
          <Link href="/app/projects">
            <Button size="sm">
              <Plus size={14} /> New project
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Contacts" value={contactCount ?? 0} color="#7B68EE" />
        <StatCard icon={FolderKanban} label="Projects" value={projectCount ?? 0} color="#5B8DEF" />
        <StatCard icon={CalendarClock} label="Due in 7 days" value={dueSoonCount ?? 0} color="#F2994A" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overdueCount ?? 0} color="#E5573F" />
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
