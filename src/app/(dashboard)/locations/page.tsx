import { prisma } from "@/lib/prisma";
import LocationForm from "./LocationForm";
import LocationRow from "./LocationRow";

export default async function LocationsPage() {
  const locations = await prisma.attendanceLocation.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Địa điểm chấm công</h1>
      <p className="text-ink/60 mb-6">
        Cấu hình toạ độ và bán kính cho phép (geofence) — nhân viên chỉ chấm công GPS hợp lệ khi ở trong phạm vi này.
      </p>

      <LocationForm />

      <div className="mt-8 border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Tên địa điểm</th>
              <th className="px-4 py-3 font-medium">Toạ độ</th>
              <th className="px-4 py-3 font-medium">Bán kính</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {locations.map((l) => (
              <LocationRow key={l.id} location={l} />
            ))}
            {locations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                  Chưa có địa điểm nào. Thêm địa điểm đầu tiên ở trên (lấy toạ độ từ Google Maps: bấm giữ vị trí → copy toạ độ).
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
