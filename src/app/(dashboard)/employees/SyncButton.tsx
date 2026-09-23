"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSync() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/employees/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Đã đồng bộ ${data.synced} nhân viên.`);
      router.refresh();
    } catch (err: any) {
      setMessage(err.message || "Đồng bộ thất bại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="text-right">
      <button
        onClick={handleSync}
        disabled={loading}
        className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors disabled:opacity-60"
      >
        {loading ? "Đang đồng bộ…" : "Đồng bộ từ Odoo"}
      </button>
      {message && <p className="text-xs text-ink/60 mt-2">{message}</p>}
    </div>
  );
}
