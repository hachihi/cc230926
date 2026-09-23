import { prisma } from "@/lib/prisma";
import DeviceForm from "./DeviceForm";
import DeviceRow from "./DeviceRow";

export default async function DevicesPage() {
  const devices = await prisma.device.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Máy chấm công</h1>
      <p className="text-ink/60 mb-6">
        Đăng ký thiết bị và lấy API key để máy chấm công gửi dữ liệu về hệ thống.
      </p>

      <DeviceForm />

      <div className="mt-8 border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Tên máy</th>
              <th className="px-4 py-3 font-medium">Số serial</th>
              <th className="px-4 py-3 font-medium">Vị trí</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">API key</th>
              <th className="px-4 py-3 font-medium">Lần cuối online</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <DeviceRow key={d.id} device={d} />
            ))}
            {devices.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink/40">
                  Chưa có máy chấm công nào. Thêm máy đầu tiên ở trên.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 border border-line bg-white p-5 text-sm text-ink/70">
        <p className="text-ink mb-2 font-medium">Tích hợp máy chấm công</p>
        <p>
          Cấu hình máy (hoặc middleware trung gian của máy, ví dụ ZKTeco/Ronald Jack) gửi HTTP POST đến:
        </p>
        <pre className="bg-paper border border-line p-3 mt-2 overflow-x-auto text-xs">{`POST /api/attendance
Header: x-device-api-key: <api key của máy>
Body: { "odooId": 123, "type": "CHECK_IN", "checkTime": "2026-09-13T08:02:00Z" }`}</pre>
      </div>
    </div>
  );
}
