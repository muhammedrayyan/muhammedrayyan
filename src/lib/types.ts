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
