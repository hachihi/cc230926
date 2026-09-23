"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeviceForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", serialNumber: "", location: "", ipAddress: "", model: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/devices", { method: "POST", body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ name: "", serialNumber: "", location: "", ipAddress: "", model: "" });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Không thể thêm máy");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors"
      >
        + Thêm máy chấm công
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-white p-5 grid grid-cols-2 gap-4">
      <input
        required
        placeholder="Tên máy (VD: Máy cổng chính)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="focus-ring border border-line px-3 py-2 col-span-2"
      />
      <input
        required
        placeholder="Số serial"
        value={form.serialNumber}
        onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
        className="focus-ring border border-line px-3 py-2"
      />
      <input
        placeholder="Model (VD: ZKTeco K40)"
        value={form.model}
        onChange={(e) => setForm({ ...form, model: e.target.value })}
        className="focus-ring border border-line px-3 py-2"
      />
      <input
        placeholder="Vị trí (VD: Cổng A - Tầng 1)"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        className="focus-ring border border-line px-3 py-2"
      />
      <input
        placeholder="Địa chỉ IP (tuỳ chọn)"
        value={form.ipAddress}
        onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
        className="focus-ring border border-line px-3 py-2"
      />

      {error && <p className="text-accent text-sm col-span-2">{error}</p>}

      <div className="col-span-2 flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors disabled:opacity-60"
        >
          {loading ? "Đang lưu…" : "Lưu máy chấm công"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="focus-ring border border-line px-4 py-2 text-sm hover:bg-paper transition-colors"
        >
          Huỷ
        </button>
      </div>
    </form>
  );
}
