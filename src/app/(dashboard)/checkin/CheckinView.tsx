"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  name: string;
  hasEmployee: boolean;
  todayIn: string | null;
  todayOut: string | null;
};

type Feedback =
  | { kind: "idle" }
  | { kind: "locating" }
  | { kind: "success"; message: string; detail: string }
  | { kind: "warning"; message: string; detail: string }
  | { kind: "error"; message: string };

export default function CheckinView({ name, hasEmployee, todayIn, todayOut }: Props) {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [feedback, setFeedback] = useState<Feedback>({ kind: "idle" });
  const nextType = todayIn && !todayOut ? "CHECK_OUT" : "CHECK_IN";

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function handlePress() {
    if (!navigator.geolocation) {
      setFeedback({ kind: "error", message: "Thiết bị không hỗ trợ định vị GPS." });
      return;
    }

    setFeedback({ kind: "locating" });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/checkin", {
            method: "POST",
            body: JSON.stringify({
              type: nextType,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Chấm công thất bại");

          const locDetail = data.location
            ? `📍 ${data.location.name} · Khoảng cách: ${data.location.distance}m`
            : "Chưa cấu hình địa điểm chấm công";

          if (data.status === "OUT_OF_RANGE") {
            setFeedback({
              kind: "warning",
              message: "Bạn đang ở ngoài phạm vi địa điểm chấm công",
              detail: locDetail,
            });
          } else if (data.status === "LOW_ACCURACY") {
            setFeedback({
              kind: "warning",
              message: "Độ chính xác GPS thấp, kết quả có thể không tin cậy",
              detail: locDetail,
            });
          } else {
            setFeedback({
              kind: "success",
              message: nextType === "CHECK_IN" ? "Check-in thành công" : "Check-out thành công",
              detail: locDetail,
            });
          }
          router.refresh();
        } catch (err: any) {
          setFeedback({ kind: "error", message: err.message || "Có lỗi xảy ra, thử lại." });
        }
      },
      () => {
        setFeedback({ kind: "error", message: "Không lấy được vị trí. Vui lòng bật Location/GPS và thử lại." });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (!hasEmployee) {
    return (
      <div className="max-w-sm mx-auto text-center py-16">
        <p className="text-ink/60">
          Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên. Liên hệ quản trị viên để được cấp quyền chấm công.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="text-center mb-8">
        <p className="text-ink/60 text-sm mb-1">Xin chào 👋</p>
        <h1 className="font-display text-2xl text-ink">{name}</h1>
        <p className="text-ink/50 text-sm mt-3">
          {now.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
        </p>
        <p className="font-display text-3xl text-brand tabular-nums">{now.toLocaleTimeString("vi-VN")}</p>
      </div>

      <button
        onClick={handlePress}
        disabled={feedback.kind === "locating"}
        className={`focus-ring w-full aspect-square max-h-56 flex flex-col items-center justify-center gap-2 text-white text-lg font-medium transition-colors ${
          nextType === "CHECK_IN" ? "bg-brand hover:bg-brandDark" : "bg-accent hover:brightness-95"
        } disabled:opacity-70`}
      >
        <span className="text-3xl">📍</span>
        {feedback.kind === "locating" ? "Đang xác định vị trí…" : nextType === "CHECK_IN" ? "CHECK IN" : "CHECK OUT"}
      </button>

      {feedback.kind === "success" && (
        <div className="mt-5 border border-brand/30 bg-brand/5 p-4 text-sm">
          <p className="text-brand font-medium">✓ {feedback.message}</p>
          <p className="text-ink/60 mt-1">{feedback.detail}</p>
        </div>
      )}
      {feedback.kind === "warning" && (
        <div className="mt-5 border border-accent/30 bg-accent/5 p-4 text-sm">
          <p className="text-accent font-medium">⚠ {feedback.message}</p>
          <p className="text-ink/60 mt-1">{feedback.detail}</p>
        </div>
      )}
      {feedback.kind === "error" && (
        <div className="mt-5 border border-accent/30 bg-accent/5 p-4 text-sm">
          <p className="text-accent font-medium">⚠ {feedback.message}</p>
        </div>
      )}

      <div className="mt-8 border-t border-line pt-5">
        <p className="text-xs text-ink/50 mb-2">Hôm nay</p>
        <div className="flex justify-between text-sm">
          <span className="text-ink/70">Check-in</span>
          <span className="text-ink">{todayIn ? new Date(todayIn).toLocaleTimeString("vi-VN") : "--:--"}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-ink/70">Check-out</span>
          <span className="text-ink">{todayOut ? new Date(todayOut).toLocaleTimeString("vi-VN") : "--:--"}</span>
        </div>
      </div>
    </div>
  );
}
