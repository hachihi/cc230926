"use client";
import { useRouter } from "next/navigation";

const ROLE_LABEL: Record<string, string> = { ADMIN: "Quản trị viên", MANAGER: "Quản lý", EMPLOYEE: "Nhân viên" };

export default function UserRow({ user }: { user: any }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`Xoá người dùng "${user.name}"?`)) return;
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3 text-ink">{user.name}</td>
      <td className="px-4 py-3 text-ink/70">{user.email}</td>
      <td className="px-4 py-3 text-ink/70">{ROLE_LABEL[user.role]}</td>
      <td className="px-4 py-3 text-ink/50 text-xs">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={handleDelete} className="text-accent text-xs hover:underline">Xoá</button>
      </td>
    </tr>
  );
}
