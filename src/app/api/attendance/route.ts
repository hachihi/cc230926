import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/attendance?employeeId=&from=&to=
 * Danh sách bản ghi chấm công (yêu cầu đăng nhập).
 *
 * POST /api/attendance
 * Hai chế độ:
 *  1) Máy chấm công đẩy dữ liệu lên: header "x-device-api-key" + body { odooId | employeeId, type, checkTime }
 *  2) Nhập tay từ giao diện quản trị: cần session đăng nhập ADMIN/MANAGER.
 */

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let employeeId = searchParams.get("employeeId") || undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Nhân viên thường chỉ được xem dữ liệu của chính mình.
  if (session.user.role === "EMPLOYEE") {
    if (!session.user.employeeId) return NextResponse.json([]);
    employeeId = session.user.employeeId;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: {
      employeeId,
      checkTime: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    },
    include: { employee: true, device: true },
    orderBy: { checkTime: "desc" },
    take: 500,
  });

  return NextResponse.json(records);
}

export async function POST(req: Request) {
  const deviceApiKey = req.headers.get("x-device-api-key");
  const body = await req.json();

  // --- Chế độ 1: máy chấm công gửi lên ---
  if (deviceApiKey) {
    const device = await prisma.device.findUnique({ where: { apiKey: deviceApiKey } });
    if (!device) return NextResponse.json({ error: "API key máy chấm công không hợp lệ" }, { status: 401 });

    const employee = body.odooId
      ? await prisma.employee.findUnique({ where: { odooId: Number(body.odooId) } })
      : await prisma.employee.findUnique({ where: { id: body.employeeId } });

    if (!employee) return NextResponse.json({ error: "Không tìm thấy nhân viên" }, { status: 404 });

    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId: employee.id,
        deviceId: device.id,
        type: body.type === "CHECK_OUT" ? "CHECK_OUT" : "CHECK_IN",
        source: "DEVICE",
        checkTime: body.checkTime ? new Date(body.checkTime) : new Date(),
      },
    });

    await prisma.device.update({
      where: { id: device.id },
      data: { lastPingAt: new Date(), status: "ONLINE" },
    });

    return NextResponse.json(record, { status: 201 });
  }

  // --- Chế độ 2: nhập tay từ UI ---
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "Không có quyền truy cập" }, { status: 403 });
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      employeeId: body.employeeId,
      type: body.type,
      source: "MANUAL",
      checkTime: new Date(body.checkTime),
      note: body.note,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
