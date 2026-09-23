"use client";
import { useRouter } from "next/navigation";

const DAY_LABEL: Record<string, string> = { "1": "CN", "2": "T2", "3": "T3", "4": "T4", "5": "T5", "6": "T6", "7": "T7" };

export default function ScheduleRow({ schedule }: { schedule: any }) {
  const router = useRouter();

  async function handleDelete() {
    if (schedule._count.employees > 0) {
      alert(`Không thể xoá — còn ${schedule._count.employees} nhân viên đang gán ca này. Gỡ gán trước.`);
      return;
    }
    if (!confirm(`Xoá ca "${schedule.name}"?`)) return;
    await fetch(`/api/schedules/${schedule.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 text-ink">{schedule.name}</td>
      <td className="px-4 py-3 text-ink/70">{schedule.startTime} – {schedule.endTime}</td>
      <td className="px-4 py-3 text-ink/70">
        {schedule.workDays.split(",").map((d: string) => DAY_LABEL[d.trim()] || d.trim()).join(", ")}
      </td>
      <td className="px-4 py-3 text-ink/70">{schedule.standardHours}h</td>
      <td className="px-4 py-3 text-ink/70">{schedule._count.employees}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={handleDelete} className="text-accent text-xs hover:underline">Xoá</button>
      </td>
    </tr>
  );
}
