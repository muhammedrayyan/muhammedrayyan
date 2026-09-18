import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ContactDetailActions } from "@/components/contacts/contact-detail-actions";
import { PRIORITY_STYLES } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Contact } from "@/lib/types";

type LinkedTask = {
  id: string;
  title: string;
  priority: string;
  project: { id: string; name: string; color: string } | null;
  status: { name: string; color: string } | null;
};

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: contact }, { data: tasks }] = await Promise.all([
    supabase.from("contacts").select("*").eq("id", id).single(),
    supabase
      .from("tasks")
      .select("id, title, priority, project:projects(id, name, color), status:task_statuses(name, color)")
      .eq("contact_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!contact) notFound();

  const typedContact = contact as Contact;
  const linkedTasks = (tasks as unknown as LinkedTask[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/app/contacts" className="text-sm text-muted hover:text-foreground">
        ← All contacts
      </Link>

      <div className="mt-4 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={typedContact.name} size={52} />
            <div>
              <h1 className="text-xl font-semibold">{typedContact.name}</h1>
              <p className="text-sm text-muted">
                {[typedContact.title, typedContact.company].filter(Boolean).join(" at ") || "—"}
              </p>
            </div>
          </div>
          <ContactDetailActions contact={typedContact} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Mail size={15} /> {typedContact.email ?? "No email"}
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Phone size={15} /> {typedContact.phone ?? "No phone"}
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Building2 size={15} /> {typedContact.company ?? "No company"}
          </div>
        </div>

        {typedContact.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {typedContact.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        {typedContact.notes && (
          <div className="mt-5 rounded-xl bg-[#faf9fd] p-4 text-sm text-foreground/80 whitespace-pre-wrap">
            {typedContact.notes}
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
          Linked tasks ({linkedTasks.length})
        </h2>
        {linkedTasks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No tasks linked to this contact yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {linkedTasks.map((task) => (
              <Link
                key={task.id}
                href={task.project ? `/app/projects/${task.project.id}` : "#"}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm hover:bg-[#faf9fd]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: task.status?.color ?? "#94A3B8" }}
                  />
                  <span className="font-medium">{task.title}</span>
                  <span className="text-muted">· {task.project?.name}</span>
                </div>
                <Badge className={PRIORITY_STYLES[task.priority]?.badge}>
                  {PRIORITY_STYLES[task.priority]?.label ?? task.priority}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
