import { prisma } from "@/lib/prisma";
import UserForm from "./UserForm";
import UserRow from "./UserRow";

export default async function UsersPage() {
  const [users, employees] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true, employeeId: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.employee.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink mb-1">Người dùng đăng nhập</h1>
      <p className="text-ink/60 mb-6">Quản lý tài khoản, phân quyền và liên kết với hồ sơ nhân viên.</p>

      <UserForm employees={employees} />

      <div className="mt-8 border border-line bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink/50">
              <th className="px-4 py-3 font-medium">Tên</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Vai trò</th>
              <th className="px-4 py-3 font-medium">Ngày tạo</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
