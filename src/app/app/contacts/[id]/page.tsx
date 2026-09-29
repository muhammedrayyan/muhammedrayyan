import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, Building2, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactDetailActions } from "@/components/contacts/contact-detail-actions";
import { ContactProperties } from "@/components/properties/contact-properties";
import {
  ESTIMATE_STATUS_STYLES,
  formatCurrency,
  PRIORITY_STYLES,
  PROPOSAL_STATUS_STYLES,
} from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Contact, Estimate, Property, Proposal } from "@/lib/types";

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

  const [{ data: contact }, { data: tasks }, { data: properties }, { data: estimates }, { data: proposals }] =
    await Promise.all([
      supabase.from("contacts").select("*").eq("id", id).single(),
      supabase
        .from("tasks")
        .select("id, title, priority, project:projects(id, name, color), status:task_statuses(name, color)")
        .eq("contact_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("properties")
        .select("*")
        .eq("contact_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("estimates")
        .select("*")
        .eq("contact_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("proposals")
        .select("*")
        .eq("contact_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (!contact) notFound();

  const typedContact = contact as Contact;
  const linkedTasks = (tasks as unknown as LinkedTask[] | null) ?? [];
  const typedProperties = (properties as Property[] | null) ?? [];
  const typedEstimates = (estimates as Estimate[] | null) ?? [];
  const typedProposals = (proposals as Proposal[] | null) ?? [];

  return (
    <div className="mx-auto max-w-4xl p-8">
      <Link href="/app/contacts" className="text-sm text-muted hover:text-foreground">
        ← All customers
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

      <ContactProperties contactId={typedContact.id} properties={typedProperties} />

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Estimates ({typedEstimates.length})
          </h2>
          <Link href={`/app/estimates/new?contact=${typedContact.id}`}>
            <Button variant="secondary" size="sm">
              <Plus size={14} /> New estimate
            </Button>
          </Link>
        </div>
        {typedEstimates.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No estimates for this customer yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {typedEstimates.map((estimate) => {
              const style = ESTIMATE_STATUS_STYLES[estimate.status];
              return (
                <Link
                  key={estimate.id}
                  href={`/app/estimates/${estimate.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm hover:bg-[#faf9fd]"
                >
                  <span className="font-medium">{estimate.number}</span>
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

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Proposals ({typedProposals.length})
          </h2>
          <Link href={`/app/proposals/new?contact=${typedContact.id}`}>
            <Button variant="secondary" size="sm">
              <Plus size={14} /> New proposal
            </Button>
          </Link>
        </div>
        {typedProposals.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No proposals for this customer yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {typedProposals.map((proposal) => {
              const style = PROPOSAL_STATUS_STYLES[proposal.status];
              return (
                <Link
                  key={proposal.id}
                  href={`/app/proposals/${proposal.id}`}
                  className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm hover:bg-[#faf9fd]"
                >
                  <span className="font-medium">{proposal.number}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted">{formatCurrency(proposal.total)}</span>
                    <Badge className={style.badge}>{style.label}</Badge>
                  </div>
                </Link>
              );
            })}
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
