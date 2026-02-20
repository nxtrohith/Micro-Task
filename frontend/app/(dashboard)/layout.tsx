import { DashboardNav } from "@/components/dashboard-nav";
import { UserSync } from "@/components/user-sync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <UserSync />
      <DashboardNav />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
