import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LogsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Nhật ký hệ thống</h1>
      <p className="text-ink/60 mb-6">200 sự kiện gần nhất — đăng nhập, chấm công, thay đổi quyền, v.v.</p>

      <div className="border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Hành động</th>
              <th className="px-4 py-3 font-medium">Module</th>
              <th className="px-4 py-3 font-medium">Mô tả</th>
              <th className="px-4 py-3 font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink/50 text-xs whitespace-nowrap">{l.createdAt.toLocaleString("vi-VN")}</td>
                <td className="px-4 py-3 text-ink">{l.action}</td>
                <td className="px-4 py-3 text-ink/70">{l.module}</td>
                <td className="px-4 py-3 text-ink/70">{l.description || "—"}</td>
                <td className="px-4 py-3 text-ink/40 text-xs">{l.ipAddress || "—"}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-ink/40">Chưa có nhật ký nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
