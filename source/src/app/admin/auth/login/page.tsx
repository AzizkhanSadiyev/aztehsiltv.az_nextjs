import Link from "next/link";
import { Sparkles } from "lucide-react";
import LoginForm from "./LoginForm";
import { getServerSession } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

interface LoginPageProps {
  searchParams?: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  const callbackUrl =
    typeof resolvedSearchParams.callbackUrl === "string"
      ? resolvedSearchParams.callbackUrl
      : "/admin";
  const errorParam =
    typeof resolvedSearchParams.error === "string"
      ? resolvedSearchParams.error
      : "";

  const initialError =
    errorParam === "CredentialsSignin"
      ? "Invalid email or password"
      : "";

  // If already authenticated, skip login page and go to target
  const session = await getServerSession();
  if (session?.user) {
    redirect(callbackUrl);
  }

  return (
    <div className="admin-auth-page">
      {/* <div className="admin-auth-glow" aria-hidden="true" /> */}

      <main className="admin-auth-shell">
        <div className="admin-auth-card">
          <div className="admin-auth-brand">
            <div className="admin-auth-logo">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="admin-auth-title">TehsilTv</p>
              <p className="admin-auth-subtitle">Admin Suite</p>
            </div>
          </div>

          <LoginForm callbackUrl={callbackUrl} initialError={initialError} />
        </div>

        <div className="admin-auth-footer">
          <Link href="/" className="admin-auth-link">
            Back to site
          </Link>
          <span>(c) {new Date().getFullYear()} TehsilTv. All rights reserved.</span>
        </div>
      </main>
    </div>
  );
}
