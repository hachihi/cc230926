import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [employeeCount, deviceCount, onlineDevices, todayEvents] = await Promise.all([
    prisma.employee.count({ where: { active: true } }),
    prisma.device.count(),
    prisma.device.count({ where: { status: "ONLINE" } }),
    prisma.attendanceRecord.count({ where: { checkTime: { gte: startOfDay } } }),
  ]);

  const stats = [
    { label: "Nhân viên đang hoạt động", value: employeeCount },
    { label: "Máy chấm công", value: deviceCount },
    { label: "Máy đang online", value: onlineDevices },
    { label: "Lượt chấm công hôm nay", value: todayEvents },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Tổng quan</h1>
      <p className="text-ink/60 mb-8">Tình hình chấm công hôm nay, {startOfDay.toLocaleDateString("vi-VN")}.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-6">
            <p className="text-3xl font-display text-brand">{s.value}</p>
            <p className="text-sm text-ink/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 border border-line bg-white p-6">
        <h2 className="font-display text-xl text-ink mb-2">Bắt đầu nhanh</h2>
        <ol className="list-decimal list-inside text-sm text-ink/70 space-y-1.5">
          <li>Vào <span className="text-brand">Nhân viên</span> để đồng bộ danh sách từ Odoo.</li>
          <li>Vào <span className="text-brand">Máy chấm công</span> để đăng ký thiết bị và lấy API key cho từng máy.</li>
          <li>Cấu hình máy chấm công gửi dữ liệu về <code className="bg-paper px-1">/api/attendance</code> kèm header <code className="bg-paper px-1">x-device-api-key</code>.</li>
          <li>Xem <span className="text-brand">Báo cáo</span> để theo dõi số giờ làm việc theo ngày.</li>
        </ol>
      </div>
    </div>
  );
}
