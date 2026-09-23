import { prisma } from "@/lib/prisma";
import SyncButton from "./SyncButton";
import ExcelImportButton from "@/components/ExcelImportButton";

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Nhân viên</h1>
          <p className="text-ink/60">Danh sách đồng bộ từ Odoo, có thể bổ sung/hiệu chỉnh bằng Excel.</p>
        </div>
        <div className="flex items-start gap-3">
          <a href="/api/employees/export" className="focus-ring border border-line bg-white px-4 py-2 text-sm hover:bg-paper transition-colors">
            Xuất Excel
          </a>
          <ExcelImportButton endpoint="/api/employees/import" />
          <SyncButton />
        </div>
      </div>

      <div className="border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Phòng ban</th>
              <th className="px-4 py-3 font-medium">Chức danh</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Đồng bộ lúc</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 text-ink">{e.name}</td>
                <td className="px-4 py-3 text-ink/70">{e.department || "—"}</td>
                <td className="px-4 py-3 text-ink/70">{e.jobTitle || "—"}</td>
                <td className="px-4 py-3 text-ink/70">{e.email || "—"}</td>
                <td className="px-4 py-3">
                  <span className={e.active ? "text-brand" : "text-ink/40"}>
                    {e.active ? "Đang làm việc" : "Ngừng"}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/50">{e.syncedAt.toLocaleString("vi-VN")}</td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink/40">
                  Chưa có dữ liệu. Nhấn "Đồng bộ từ Odoo" để tải danh sách nhân viên.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
