import { prisma } from "@/lib/prisma";
import ExcelImportButton from "@/components/ExcelImportButton";
import ScheduleForm from "./ScheduleForm";
import ScheduleRow from "./ScheduleRow";
import EmployeeScheduleRow from "./EmployeeScheduleRow";

export default async function SchedulesPage() {
  const [schedules, employees] = await Promise.all([
    prisma.workSchedule.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { employees: true } } },
    }),
    prisma.employee.findMany({ orderBy: { name: "asc" }, include: { workSchedule: true } }),
  ]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">Giờ làm việc</h1>
          <p className="text-ink/60">Định nghĩa ca làm việc và gán cho từng nhân viên.</p>
        </div>
        <div className="flex items-start gap-3">
          <a href="/api/schedules/export" className="focus-ring border border-line bg-white px-4 py-2 text-sm hover:bg-paper transition-colors">
            Xuất Excel
          </a>
          <ExcelImportButton endpoint="/api/schedules/import" label="Nhập gán ca từ Excel" />
        </div>
      </div>

      <h2 className="font-display text-xl text-ink mb-3">Ca làm việc</h2>
      <ScheduleForm />

      <div className="mt-4 border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Tên ca</th>
              <th className="px-4 py-3 font-medium">Giờ làm việc</th>
              <th className="px-4 py-3 font-medium">Ngày trong tuần</th>
              <th className="px-4 py-3 font-medium">Giờ chuẩn/ngày</th>
              <th className="px-4 py-3 font-medium">Số NV đang gán</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {schedules.map((s) => (
              <ScheduleRow key={s.id} schedule={s} />
            ))}
            {schedules.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-ink/40">Chưa có ca làm việc nào. Thêm ca đầu tiên ở trên.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="font-display text-xl text-ink mb-3 mt-10">Gán ca cho nhân viên</h2>
      <div className="border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Nhân viên</th>
              <th className="px-4 py-3 font-medium">Phòng ban</th>
              <th className="px-4 py-3 font-medium">Ca làm việc</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <EmployeeScheduleRow key={e.id} employee={e} schedules={schedules} />
            ))}
            {employees.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-ink/40">Chưa có nhân viên. Đồng bộ từ Odoo trước ở trang Nhân viên.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
