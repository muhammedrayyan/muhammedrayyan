-- Harden trigger functions against a mutable search_path (Supabase linter:
-- function_search_path_mutable). Pins search_path so these SECURITY INVOKER
-- functions can't be tricked by a caller-controlled search_path.

alter function public.set_updated_at() set search_path = public;
