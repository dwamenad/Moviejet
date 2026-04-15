import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireSession();

  return <AdminShell email={session.email}>{children}</AdminShell>;
}
