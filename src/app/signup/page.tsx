"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/app");
      router.refresh();
      return;
    }

    setNeedsConfirmation(true);
  }

  if (needsConfirmation) {
    return (
      <AuthCard
        title="Check your inbox"
        subtitle="Almost there"
        footer={
          <Link href="/login" className="font-medium text-primary">
            Back to sign in
          </Link>
        }
      >
        <p className="text-sm text-muted">
          We sent a confirmation link to <strong>{email}</strong>. Click it to
          activate your account, then sign in.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create your workspace"
      subtitle="Start organizing your contacts and work"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ada Lovelace"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        {error && <p className="text-sm text-rose-500">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
