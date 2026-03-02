"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export interface LoginState {
  error: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const rawCallbackUrl = String(formData.get("callbackUrl") || "/admin").trim();
  const callbackUrl = rawCallbackUrl.startsWith("/") ? rawCallbackUrl : "/admin";

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const resultUrl = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo: callbackUrl,
    });

    const url = new URL(String(resultUrl), "http://localhost");
    const error = url.searchParams.get("error");

    if (error) {
      return { error: "Invalid email or password" };
    }
  } catch (err) {
    console.error("Login error:", err);
    return { error: "Login failed. Please try again." };
  }

  redirect(callbackUrl);
}
