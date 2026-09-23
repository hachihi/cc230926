"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABEL: Record<string, string> = {
  ONLINE: "Đang hoạt động",
  OFFLINE: "Ngoại tuyến",
  MAINTENANCE: "Bảo trì",
};

export default function DeviceRow({ device }: { device: any }) {
  const router = useRouter();
  const [showKey, setShowKey] = useState(false);

  async function handleDelete() {
    if (!confirm(`Xoá máy "${device.name}"?`)) return;
    await fetch(`/api/devices/${device.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 text-ink">{device.name}</td>
      <td className="px-4 py-3 text-ink/70">{device.serialNumber}</td>
      <td className="px-4 py-3 text-ink/70">{device.location || "—"}</td>
      <td className="px-4 py-3">
        <span className={device.status === "ONLINE" ? "text-brand" : "text-ink/40"}>
          {STATUS_LABEL[device.status]}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-xs">
        {showKey ? device.apiKey : "••••••••••••"}{" "}
        <button onClick={() => setShowKey(!showKey)} className="text-brand underline ml-1">
          {showKey ? "ẩn" : "hiện"}
        </button>
      </td>
      <td className="px-4 py-3 text-ink/50 text-xs">
        {device.lastPingAt ? new Date(device.lastPingAt).toLocaleString("vi-VN") : "Chưa từng"}
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={handleDelete} className="text-accent text-xs hover:underline">
          Xoá
        </button>
      </td>
    </tr>
  );
}
