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
    <div className="relative min-h-screen overflow-hidden bg-[#f2f6fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(191,210,166,0.18),_transparent_55%)]" />

      <main className="relative mx-auto flex min-h-screen max-w-xl items-center px-6 py-16">
        <div className="mx-auto w-full max-w-[480px] space-y-8">
          <div className="rounded-[28px] p-[1px]">
            <div className="rounded-[28px] p-7 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--admin-primary-dark)] text-white shadow-[0_12px_30px_rgba(147,171,121,0.35)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-[var(--admin-primary-dark)]">
                    Aztehsil TV
                  </p>
                  <p className="text-sm text-slate-500">Admin Panel</p>
                </div>
              </div>

              <LoginForm callbackUrl={callbackUrl} initialError={initialError} />

              {/* <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <span>Demo access</span>
                  <span className="rounded-full bg-[var(--admin-primary-light)] px-2 py-0.5 text-[var(--admin-primary-dark)]">
                    Test
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Email</span>
                    <code className="rounded px-2 py-0.5 text-xs font-mono">
                      admin@aztehsiltv.az
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Password</span>
                    <code className="rounded px-2 py-0.5 text-xs font-mono">
                      admin123
                    </code>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="font-medium text-[var(--admin-primary-dark)] hover:underline">
              Back to site
            </Link>
            <span>(c) {new Date().getFullYear()} Aztehsil TV. All rights reserved.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
