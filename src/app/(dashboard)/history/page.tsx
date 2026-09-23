import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const STATUS_LABEL: Record<string, string> = {
  VALID: "Hợp lệ",
  OUT_OF_RANGE: "Ngoài phạm vi",
  LOW_ACCURACY: "GPS không chính xác",
};

const SOURCE_LABEL: Record<string, string> = {
  DEVICE: "Máy chấm công",
  MANUAL: "Nhập tay",
  API: "API",
  APP_GPS: "GPS điện thoại",
};

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const employeeId = session?.user.employeeId;

  const records = employeeId
    ? await prisma.attendanceRecord.findMany({
        where: { employeeId },
        include: { attendanceLocation: true },
        orderBy: { checkTime: "desc" },
        take: 100,
      })
    : [];

  // Nhóm theo ngày
  const byDay = new Map<string, typeof records>();
  for (const r of records) {
    const key = r.checkTime.toLocaleDateString("vi-VN");
    if (!byDay.has(key)) byDay.set(key, [] as any);
    byDay.get(key)!.push(r);
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Lịch sử chấm công</h1>
      <p className="text-ink/60 mb-6">Chỉ hiển thị dữ liệu chấm công của chính bạn.</p>

      {!employeeId && (
        <p className="text-ink/50 border border-line bg-white p-6 text-center">
          Tài khoản của bạn chưa liên kết với hồ sơ nhân viên.
        </p>
      )}

      <div className="space-y-6">
        {Array.from(byDay.entries()).map(([day, dayRecords]) => (
          <div key={day} className="border border-line bg-white">
            <div className="px-4 py-2.5 bg-paper border-b border-line text-sm text-ink/70">{day}</div>
            <div className="divide-y divide-line">
              {dayRecords.map((r) => (
                <div key={r.id} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-ink">{r.checkTime.toLocaleTimeString("vi-VN")}</span>
                    <span className={r.type === "CHECK_IN" ? "text-brand" : "text-accent"}>
                      {r.type === "CHECK_IN" ? "Check-in" : "Check-out"}
                    </span>
                    <span className="text-ink/40 text-xs">{SOURCE_LABEL[r.source]}</span>
                  </div>
                  <div className="text-right text-xs text-ink/50">
                    {r.attendanceLocation && <span>📍 {r.attendanceLocation.name} · </span>}
                    {r.distanceMeters != null && <span>{Math.round(r.distanceMeters)}m · </span>}
                    <span className={r.status !== "VALID" ? "text-accent" : ""}>{STATUS_LABEL[r.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {employeeId && byDay.size === 0 && (
          <p className="text-ink/40 border border-line bg-white p-10 text-center">Chưa có dữ liệu chấm công.</p>
        )}
      </div>
    </div>
  );
}
