import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseExcelFile, pick } from "@/lib/excel";

/**
 * POST /api/attendance/import
 * Nhập/hiệu chỉnh chấm công hàng loạt từ Excel — dùng khi cần bổ sung công cho nhân viên quên
 * chấm công, hoặc nạp dữ liệu chấm công cũ.
 * Cột nhận diện: "Email" (bắt buộc), "Loại" (CHECK_IN/CHECK_OUT hoặc "Vào"/"Ra"),
 * "Thời gian" (VD 2026-09-13 08:02, hoặc Excel tự nhận diện ngày giờ), "Ghi chú" (tuỳ chọn).
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Thiếu file" }, { status: 400 });

  const rows = await parseExcelFile(file);
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const emailRaw = pick(row, "Email", "email");
    const email = emailRaw ? String(emailRaw).trim().toLowerCase() : null;
    const typeRaw = String(pick(row, "Loại", "Type") || "").trim().toUpperCase();
    const timeRaw = pick(row, "Thời gian", "Time", "Check time");
    const note = pick(row, "Ghi chú", "Note");

    const type = typeRaw === "CHECK_IN" || typeRaw === "VÀO" || typeRaw === "VAO" ? "CHECK_IN"
      : typeRaw === "CHECK_OUT" || typeRaw === "RA" ? "CHECK_OUT" : null;

    const checkTime = timeRaw
      ? typeof timeRaw === "number"
        ? new Date(Math.round((timeRaw - 25569) * 86400 * 1000)) // Excel serial date -> JS Date
        : new Date(timeRaw)
      : null;

    if (!email || !type || !checkTime || isNaN(checkTime.getTime())) {
      skipped++;
      continue;
    }

    const employee = await prisma.employee.findFirst({ where: { email } });
    if (!employee) {
      skipped++;
      continue;
    }

    await prisma.attendanceRecord.create({
      data: { employeeId: employee.id, type, source: "MANUAL", checkTime, note: note ? String(note) : "Nhập từ Excel" },
    });
    created++;
  }

  return NextResponse.json({ total: rows.length, created, updated: 0, skipped });
}
