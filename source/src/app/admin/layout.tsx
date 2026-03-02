export const runtime = 'nodejs';

import "@/styles/admin.css";

import { getServerSession } from "@/lib/auth-utils";
import { ToastProvider } from "@/components/admin/ui/ToastProvider";
import AdminLayoutClient from "./admin-layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // If no session, just render children (auth pages)
  // The middleware handles redirects, so we don't need to check here
  if (!session) {
    // Still wrap with ToastProvider so client pages using useToast
    // don't error if middleware didn't redirect in time.
    return (
      <ToastProvider>
        <div className="admin-layout admin-auth">{children}</div>
      </ToastProvider>
    );
  }

  // If authenticated, wrap with admin layout
  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}
