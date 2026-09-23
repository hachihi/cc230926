import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen flex bg-paper">
      <Sidebar role={session.user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar name={session.user.name || ""} role={session.user.role} />
        <main className="flex-1 px-8 py-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
