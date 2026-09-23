"use client";
import { useRouter } from "next/navigation";

export default function LocationRow({ location }: { location: any }) {
  const router = useRouter();

  async function toggleActive() {
    await fetch(`/api/locations/${location.id}`, { method: "PATCH", body: JSON.stringify({ active: !location.active }) });
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Xoá địa điểm "${location.name}"?`)) return;
    await fetch(`/api/locations/${location.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 text-ink">{location.name}</td>
      <td className="px-4 py-3 text-ink/70 text-xs font-mono">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</td>
      <td className="px-4 py-3 text-ink/70">{location.radiusMeters}m</td>
      <td className="px-4 py-3">
        <button onClick={toggleActive} className={location.active ? "text-brand" : "text-ink/40"}>
          {location.active ? "● Hoạt động" : "○ Tạm dừng"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button onClick={handleDelete} className="text-accent text-xs hover:underline">Xoá</button>
      </td>
    </tr>
  );
}
