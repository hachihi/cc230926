"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LocationForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", latitude: "", longitude: "", radiusMeters: "100" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          latitude: parseFloat(form.latitude),
          longitude: parseFloat(form.longitude),
          radiusMeters: parseInt(form.radiusMeters, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ name: "", latitude: "", longitude: "", radiusMeters: "100" });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Không thể thêm địa điểm");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors">
        + Thêm địa điểm
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-white p-5 grid grid-cols-2 gap-4">
      <input required placeholder="Tên địa điểm (VD: Văn phòng HACHIHI)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="focus-ring border border-line px-3 py-2 col-span-2" />
      <input required type="number" step="any" placeholder="Latitude (VD: 10.7765)" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="focus-ring border border-line px-3 py-2" />
      <input required type="number" step="any" placeholder="Longitude (VD: 106.7009)" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="focus-ring border border-line px-3 py-2" />
      <input required type="number" placeholder="Bán kính (m)" value={form.radiusMeters} onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })} className="focus-ring border border-line px-3 py-2 col-span-2" />

      {error && <p className="text-accent text-sm col-span-2">{error}</p>}

      <div className="col-span-2 flex gap-3">
        <button type="submit" disabled={loading} className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors disabled:opacity-60">
          {loading ? "Đang lưu…" : "Lưu địa điểm"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="focus-ring border border-line px-4 py-2 text-sm hover:bg-paper transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  );
}
