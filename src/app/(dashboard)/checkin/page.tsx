import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckinView from "./CheckinView";

export default async function CheckinPage() {
  const session = await getServerSession(authOptions);
  const employeeId = session?.user.employeeId;

  let todayIn: string | null = null;
  let todayOut: string | null = null;

  if (employeeId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const records = await prisma.attendanceRecord.findMany({
      where: { employeeId, checkTime: { gte: startOfDay } },
      orderBy: { checkTime: "asc" },
    });

    const inRec = records.find((r) => r.type === "CHECK_IN");
    const outRec = [...records].reverse().find((r) => r.type === "CHECK_OUT");
    todayIn = inRec ? inRec.checkTime.toISOString() : null;
    todayOut = outRec ? outRec.checkTime.toISOString() : null;
  }

  return (
    <CheckinView
      name={session?.user.name || ""}
      hasEmployee={!!employeeId}
      todayIn={todayIn}
      todayOut={todayOut}
    />
  );
}
