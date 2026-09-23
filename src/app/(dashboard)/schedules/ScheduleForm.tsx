"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const DAYS = [
  { code: "2", label: "T2" },
  { code: "3", label: "T3" },
  { code: "4", label: "T4" },
  { code: "5", label: "T5" },
  { code: "6", label: "T6" },
  { code: "7", label: "T7" },
  { code: "1", label: "CN" },
];

export default function ScheduleForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", startTime: "08:00", endTime: "17:30", standardHours: "8", note: "" });
  const [days, setDays] = useState<string[]>(["2", "3", "4", "5", "6"]);

  function toggleDay(code: string) {
    setDays((d) => (d.includes(code) ? d.filter((x) => x !== code) : [...d, code]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (days.length === 0) {
      setError("Chọn ít nhất một ngày làm việc");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        body: JSON.stringify({ ...form, standardHours: parseFloat(form.standardHours), workDays: days.join(",") }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ name: "", startTime: "08:00", endTime: "17:30", standardHours: "8", note: "" });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Không thể tạo ca làm việc");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors">
        + Thêm ca làm việc
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-white p-5 grid grid-cols-2 gap-4">
      <input required placeholder="Tên ca (VD: Ca hành chính)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="focus-ring border border-line px-3 py-2 col-span-2" />
      <div>
        <label className="block text-xs text-ink/50 mb-1">Giờ bắt đầu</label>
        <input required type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="focus-ring border border-line px-3 py-2 w-full" />
      </div>
      <div>
        <label className="block text-xs text-ink/50 mb-1">Giờ kết thúc</label>
        <input required type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="focus-ring border border-line px-3 py-2 w-full" />
      </div>

      <div className="col-span-2">
        <label className="block text-xs text-ink/50 mb-1">Ngày làm việc trong tuần</label>
        <div className="flex gap-2 flex-wrap">
          {DAYS.map((d) => (
            <button
              type="button"
              key={d.code}
              onClick={() => toggleDay(d.code)}
              className={`px-3 py-1.5 text-sm border ${days.includes(d.code) ? "bg-brand text-white border-brand" : "border-line text-ink/60 hover:bg-paper"}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <input required type="number" step="0.5" placeholder="Số giờ chuẩn/ngày" value={form.standardHours} onChange={(e) => setForm({ ...form, standardHours: e.target.value })} className="focus-ring border border-line px-3 py-2" />
      <input placeholder="Ghi chú (tuỳ chọn)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="focus-ring border border-line px-3 py-2" />

      {error && <p className="text-accent text-sm col-span-2">{error}</p>}

      <div className="col-span-2 flex gap-3">
        <button type="submit" disabled={loading} className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors disabled:opacity-60">
          {loading ? "Đang lưu…" : "Lưu ca làm việc"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="focus-ring border border-line px-4 py-2 text-sm hover:bg-paper transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  );
}
