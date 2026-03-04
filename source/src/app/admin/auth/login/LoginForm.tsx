"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { loginAction, type LoginState } from "./actions";

interface LoginFormProps {
  callbackUrl: string;
  initialError?: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="admin-auth-submit"
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
    </button>
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
    <form action={formAction} className="admin-auth-form">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div className="admin-auth-field">
        <label htmlFor="email" className="admin-auth-label">
          Email
        </label>
        <div className="admin-auth-input-wrapper">
          <Mail className="admin-auth-input-icon" />
          <input
            id="email"
            name="email"
            type="email"
            placeholder="admin@aztehsiltv.az"
            autoComplete="email"
            required
            className="admin-auth-input"
          />
        </div>
      </div>

      <div className="admin-auth-field">
        <label htmlFor="password" className="admin-auth-label">
          Password
        </label>
        <div className="admin-auth-input-wrapper">
          <Lock className="admin-auth-input-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="********"
            autoComplete="current-password"
            required
            className="admin-auth-input admin-auth-input--with-action"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="admin-auth-icon-button"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="admin-auth-meta">
        <label className="admin-auth-remember">
          <input type="checkbox" />
          Remember me
        </label>
      </div>

      {state.error ? (
        <div className="admin-auth-error">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{state.error}</p>
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}
