"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EmployeeScheduleRow({ employee, schedules }: { employee: any; schedules: any[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSaving(true);
    await fetch(`/api/employees/${employee.id}`, {
      method: "PATCH",
      body: JSON.stringify({ workScheduleId: e.target.value || null }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 text-ink">{employee.name}</td>
      <td className="px-4 py-3 text-ink/70">{employee.department || "—"}</td>
      <td className="px-4 py-3">
        <select
          defaultValue={employee.workScheduleId || ""}
          onChange={handleChange}
          disabled={saving}
          className="focus-ring border border-line px-2 py-1.5 text-sm bg-white"
        >
          <option value="">— Chưa gán —</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </td>
    </tr>
  );
}
