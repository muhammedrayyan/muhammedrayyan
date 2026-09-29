export type TaskPriority = "low" | "normal" | "high" | "urgent";

export type Profile = {
  id: string;
  full_name: string | null;
  avatar_color: string;
  created_at: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  notes: string | null;
  tags: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_by: string | null;
  created_at: string;
};

export type TaskStatus = {
  id: string;
  project_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
};

export type Task = {
  id: string;
  project_id: string;
  status_id: string;
  contact_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  position: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskWithRelations = Task & {
  assignee: Profile | null;
  contact: Pick<Contact, "id" | "name"> | null;
};

export type PropertyType = "residential" | "commercial" | "municipal" | "hoa";

export type Property = {
  id: string;
  contact_id: string;
  label: string;
  property_type: PropertyType;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  surface_type: string | null;
  square_footage: number | null;
  salt_sensitive: boolean;
  gate_code: string | null;
  access_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ServiceCategory =
  | "plowing"
  | "salting"
  | "shoveling"
  | "hauling"
  | "seasonal"
  | "other";

export type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  unit: string;
  default_rate: number;
  description: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EstimateStatus = "draft" | "sent" | "approved" | "declined" | "expired";
export type ProposalStatus = "draft" | "sent" | "accepted" | "declined" | "expired";

export type LineItem = {
  id: string;
  service_id: string | null;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  position: number;
  created_at: string;
};

export type LineItemInput = {
  service_id: string | null;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
};

export type Estimate = {
  id: string;
  number: string;
  contact_id: string;
  property_id: string | null;
  season: string | null;
  status: EstimateStatus;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type EstimateLineItem = LineItem & { estimate_id: string };

export type EstimateWithRelations = Estimate & {
  contact: Pick<Contact, "id" | "name" | "company"> | null;
  property: Pick<Property, "id" | "label"> | null;
};

export type Proposal = {
  id: string;
  number: string;
  estimate_id: string | null;
  contact_id: string;
  property_id: string | null;
  status: ProposalStatus;
  valid_until: string | null;
  notes: string | null;
  terms: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  sent_at: string | null;
  accepted_at: string | null;
  declined_at: string | null;
  signed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProposalLineItem = LineItem & { proposal_id: string };

export type ProposalWithRelations = Proposal & {
  contact: Pick<Contact, "id" | "name" | "company"> | null;
  property: Pick<Property, "id" | "label"> | null;
};
