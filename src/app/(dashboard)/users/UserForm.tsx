"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserForm({ employees }: { employees: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", employeeId: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", { method: "POST", body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm({ name: "", email: "", password: "", role: "EMPLOYEE", employeeId: "" });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Không thể tạo người dùng");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors">
        + Thêm người dùng
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line bg-white p-5 grid grid-cols-2 gap-4">
      <input required placeholder="Họ tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="focus-ring border border-line px-3 py-2" />
      <input required type="email" placeholder="Email đăng nhập" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="focus-ring border border-line px-3 py-2" />
      <input required type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="focus-ring border border-line px-3 py-2" />
      <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="focus-ring border border-line px-3 py-2">
        <option value="EMPLOYEE">Nhân viên</option>
        <option value="MANAGER">Quản lý</option>
        <option value="ADMIN">Quản trị viên</option>
      </select>
      <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="focus-ring border border-line px-3 py-2 col-span-2">
        <option value="">Không liên kết hồ sơ nhân viên</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>{emp.name}</option>
        ))}
      </select>

      {error && <p className="text-accent text-sm col-span-2">{error}</p>}

      <div className="col-span-2 flex gap-3">
        <button type="submit" disabled={loading} className="focus-ring bg-brand text-white px-4 py-2 text-sm hover:bg-brandDark transition-colors disabled:opacity-60">
          {loading ? "Đang tạo…" : "Tạo người dùng"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="focus-ring border border-line px-4 py-2 text-sm hover:bg-paper transition-colors">
          Huỷ
        </button>
      </div>
    </form>
  );
}
