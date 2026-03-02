"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";
import { cn } from "@/lib/utils";

interface LoginFormProps {
  callbackUrl: string;
  initialError?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="h-11 w-full rounded-xl bg-[var(--admin-primary-dark)] text-white hover:bg-[var(--admin-primary-hover)]"
      disabled={pending}
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Signing in...</span>
        </span>
      ) : (
        "Sign in"
      )}
    </Button>
  );
}

export default function LoginForm({
  callbackUrl,
  initialError = "",
}: LoginFormProps) {
  const initialState: LoginState = { error: initialError };
  const [state, formAction] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mt-6 space-y-6 px-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="space-y-3">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@aztehsiltv.az"
            autoComplete="email"
            required
            className={cn("h-11 rounded-xl pl-10")}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            autoComplete="current-password"
            required
            className={cn("h-11 rounded-xl pl-10 pr-10")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-[var(--admin-primary-dark)] focus:ring-[var(--admin-primary-hover)]"
          />
          Remember me
        </label>
      </div>

      {state.error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/50 bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{state.error}</p>
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
