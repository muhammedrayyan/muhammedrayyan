import Link from "next/link";
import { MapPin, Snowflake } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import type { Property } from "@/lib/types";

type PropertyRow = Property & { contact: { id: string; name: string } | null };

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("*, contact:contacts(id, name)")
    .order("created_at", { ascending: false });

  const rows = (properties as unknown as PropertyRow[] | null) ?? [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Properties</h1>
        <p className="mt-1 text-sm text-muted">
          Every service site on file, across all customers. Add or edit a property from its
          customer&apos;s contact page.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted">
            No properties yet. Open a contact to add its first service site.
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Property</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Address</th>
                <th className="px-5 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((property) => (
                <tr key={property.id} className="border-b border-border last:border-0 hover:bg-[#faf9fd]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      <MapPin size={14} className="text-muted" />
                      {property.label}
                      {property.salt_sensitive && (
                        <Snowflake size={13} className="text-sky-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {property.contact ? (
                      <Link
                        href={`/app/contacts/${property.contact.id}`}
                        className="text-primary hover:underline"
                      >
                        {property.contact.name}
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Badge>{PROPERTY_TYPE_LABELS[property.property_type]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {[property.address_line1, property.city, property.state]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3 text-muted">{property.access_notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
